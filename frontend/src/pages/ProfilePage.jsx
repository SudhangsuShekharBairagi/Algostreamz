import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Edit3,
  LockKeyhole,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../config/siteLinks";
import { useAuth } from "../context/AuthContext";
import profileApi from "../services/profileApi";
import { errorMessage, fieldErrors } from "../services/api";

const PROFILE_FIELDS = [
  ["displayName", "Display name"],
  ["bio", "Bio"],
  ["avatarUrl", "Avatar URL"],
  ["college", "College"],
  ["studyYear", "Study year"],
  ["location", "Location"],
];

function toProfileForm(profile = {}) {
  const source = profile || {};
  return PROFILE_FIELDS.reduce((result, [key]) => {
    result[key] = source[key] == null ? "" : String(source[key]);
    return result;
  }, {});
}

function initialsFor(profile) {
  const name = profile?.displayName?.trim() || profile?.email || "User";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const { user, syncUser, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user || {});
  const [form, setForm] = useState(() => toProfileForm(user));
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState(null);
  const [progress, setProgress] = useState(null);
  const [progressUnavailable, setProgressUnavailable] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const dialogRef = useRef(null);
  const deleteTriggerRef = useRef(null);
  const isDirty = useMemo(
    () =>
      editing &&
      JSON.stringify(form) !== JSON.stringify(toProfileForm(profile)),
    [editing, form, profile],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPageError("");
    profileApi
      .get()
      .then(({ data }) => {
        if (!active) return;
        setProfile(data);
        setForm(toProfileForm(data));
        syncUser(data);
      })
      .catch((error) => {
        if (active)
          setPageError(errorMessage(error, "Unable to load your profile."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    profileApi
      .getProgress()
      .then(({ data }) => {
        if (active) setProgress(data);
      })
      .catch(() => {
        if (active) setProgressUnavailable(true);
      });

    return () => {
      active = false;
    };
  }, [syncUser]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!isDirty) return undefined;
    const message =
      "You have unsaved profile changes. Leave this page and discard them?";
    const currentUrl = `${location.pathname}${location.search}${location.hash}`;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const handleInternalNavigation = (event) => {
      const anchor =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (!anchor || anchor.target || anchor.origin !== window.location.origin)
        return;
      const target = new URL(anchor.href);
      if (
        `${target.pathname}${target.search}${target.hash}` ===
        `${location.pathname}${location.search}${location.hash}`
      )
        return;
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
      }
    };
    const handleHistoryNavigation = (event) => {
      if (!window.confirm(message)) {
        event.stopImmediatePropagation();
        window.history.pushState(null, "", currentUrl);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleHistoryNavigation, true);
    document.addEventListener("click", handleInternalNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleHistoryNavigation, true);
      document.removeEventListener("click", handleInternalNavigation, true);
    };
  }, [isDirty, location.hash, location.pathname, location.search]);

  useEffect(() => {
    if (!deleteOpen) return undefined;
    const previousFocus = document.activeElement;
    dialogRef.current?.querySelector("input")?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setDeleteOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [
        ...dialogRef.current.querySelectorAll(
          "input:not(:disabled), button:not(:disabled)",
        ),
      ];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const focusTarget =
        previousFocus === document.body
          ? deleteTriggerRef.current
          : previousFocus;
      focusTarget?.focus?.();
    };
  }, [deleteOpen]);

  const changeProfileField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setProfileErrors((current) => ({ ...current, [key]: "" }));
  };

  const validateProfile = () => {
    const errors = {};
    if (form.displayName.length > 80)
      errors.displayName = "Display name must be 80 characters or fewer.";
    if (form.bio.length > 500)
      errors.bio = "Bio must be 500 characters or fewer.";
    if (
      form.avatarUrl.trim() &&
      !/^https?:\/\/\S+$/i.test(form.avatarUrl.trim())
    ) {
      errors.avatarUrl =
        "Enter a valid URL beginning with http:// or https://.";
    }
    if (form.college.length > 120)
      errors.college = "College must be 120 characters or fewer.";
    if (form.location.length > 120)
      errors.location = "Location must be 120 characters or fewer.";
    if (
      form.studyYear &&
      (!/^\d+$/.test(form.studyYear) ||
        Number(form.studyYear) < 1 ||
        Number(form.studyYear) > 12)
    ) {
      errors.studyYear = "Study year must be a whole number from 1 to 12.";
    }
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const startEditing = () => {
    setForm(toProfileForm(profile));
    setProfileErrors({});
    setPageError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setForm(toProfileForm(profile));
    setProfileErrors({});
    setPageError("");
    setEditing(false);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!validateProfile()) return;
    setSaving(true);
    setPageError("");
    try {
      const payload = {
        displayName: form.displayName.trim() || null,
        bio: form.bio.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
        college: form.college.trim() || null,
        studyYear: form.studyYear ? Number(form.studyYear) : null,
        location: form.location.trim() || null,
      };
      const { data } = await profileApi.update(payload);
      setProfile(data);
      setForm(toProfileForm(data));
      syncUser(data);
      setEditing(false);
      setToast({ type: "success", message: "Profile saved." });
    } catch (error) {
      setProfileErrors(fieldErrors(error) || {});
      setPageError(errorMessage(error, "Unable to save your profile."));
      setToast({
        type: "error",
        message: errorMessage(error, "Unable to save your profile."),
      });
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!passwordForm.currentPassword)
      errors.currentPassword = "Enter your current password.";
    if (
      passwordForm.newPassword.length < 8 ||
      passwordForm.newPassword.length > 72
    )
      errors.newPassword = "Use 8 to 72 characters.";
    if (passwordForm.confirmPassword !== passwordForm.newPassword)
      errors.confirmPassword = "Passwords do not match.";
    setPasswordErrors(errors);
    if (Object.keys(errors).length) return;

    setPasswordSaving(true);
    try {
      await profileApi.changePassword(passwordForm);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setToast({ type: "success", message: "Password changed." });
    } catch (error) {
      setPasswordErrors(fieldErrors(error) || {});
      setToast({
        type: "error",
        message: errorMessage(error, "Unable to change your password."),
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const deleteAccount = async (event) => {
    event.preventDefault();
    if (!deletePassword) {
      setDeleteError("Enter your password to confirm account deletion.");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      await profileApi.deleteAccount(deletePassword);
      await signOut();
      navigate(ROUTES.HOME, { replace: true });
    } catch (error) {
      setDeleteError(errorMessage(error, "Unable to delete your account."));
      setDeleting(false);
    }
  };

  const progressItems = progress
    ? [
        ["completedVisualizers", "Completed visualizers"],
        ["challengesMastered", "Challenges mastered"],
        ["overallMastery", "Overall mastery"],
      ].filter(([key]) => Object.hasOwn(progress, key))
    : [];

  if (loading) {
    return (
      <p className="py-12 text-center text-body text-ink-muted" role="status">
        Loading profile...
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7 pb-12">
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-sm border px-4 py-3 shadow-e3 ${toast.type === "success" ? "border-state-sorted bg-surface text-ink" : "border-state-swap bg-surface text-ink"}`}
          role={toast.type === "success" ? "status" : "alert"}
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">
            Account
          </span>
          <h1 className="mt-2 font-display text-h1 font-semibold text-ink">
            Your profile
          </h1>
          <p className="mt-1 text-body text-ink-muted">
            Manage your account details and security.
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="btn-primary inline-flex min-h-10 items-center gap-2 px-4 text-caption font-semibold focus-ring"
          >
            <Edit3 className="h-4 w-4" />
            Edit profile
          </button>
        )}
      </header>

      {pageError && (
        <p
          className="text-caption text-state-swap"
          role="alert"
          aria-live="polite"
        >
          {pageError}
        </p>
      )}

      <section className="space-y-4" aria-labelledby="account-details-heading">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-accent" />
          <h2
            id="account-details-heading"
            className="font-display text-h3 font-semibold text-ink"
          >
            Account details
          </h2>
        </div>
        <div className="card space-y-5 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-4 border-b border-line pb-5">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Profile avatar"
                className="h-16 w-16 rounded-full border border-line object-cover"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft font-display text-h3 font-semibold text-accent-strong"
                aria-label={`Initials ${initialsFor(profile)}`}
              >
                {initialsFor(profile)}
              </div>
            )}
            <div>
              <p className="font-display text-h3 font-semibold text-ink">
                {profile.displayName || "Add a display name"}
              </p>
              <p className="text-caption text-ink-muted">{profile.email}</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={saveProfile} noValidate className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ProfileField
                  id="displayName"
                  label="Display name"
                  value={form.displayName}
                  maxLength={80}
                  error={profileErrors.displayName}
                  onChange={(value) => changeProfileField("displayName", value)}
                />
                <ProfileField
                  id="avatarUrl"
                  label="Avatar URL"
                  value={form.avatarUrl}
                  maxLength={2048}
                  error={profileErrors.avatarUrl}
                  onChange={(value) => changeProfileField("avatarUrl", value)}
                />
                <ProfileField
                  id="college"
                  label="College"
                  value={form.college}
                  maxLength={120}
                  error={profileErrors.college}
                  onChange={(value) => changeProfileField("college", value)}
                />
                <ProfileField
                  id="studyYear"
                  label="Study year"
                  type="number"
                  min="1"
                  max="12"
                  value={form.studyYear}
                  error={profileErrors.studyYear}
                  onChange={(value) => changeProfileField("studyYear", value)}
                />
                <ProfileField
                  id="location"
                  label="Location"
                  value={form.location}
                  maxLength={120}
                  error={profileErrors.location}
                  onChange={(value) => changeProfileField("location", value)}
                />
                <ProfileField
                  id="profileEmail"
                  label="Email"
                  value={profile.email || ""}
                  readOnly
                />
              </div>
              <ProfileField
                id="bio"
                label="Bio"
                as="textarea"
                rows={4}
                maxLength={500}
                value={form.bio}
                error={profileErrors.bio}
                onChange={(value) => changeProfileField("bio", value)}
              />
              <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="btn-ghost inline-flex min-h-10 items-center gap-2 border border-line px-4 text-caption font-semibold text-ink focus-ring disabled:opacity-50"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !isDirty}
                  className="btn-primary inline-flex min-h-10 items-center gap-2 px-4 text-caption font-semibold focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />{" "}
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <ProfileDetail label="College" value={profile.college} />
              <ProfileDetail
                label="Study year"
                value={profile.studyYear ? `Year ${profile.studyYear}` : null}
              />
              <ProfileDetail label="Location" value={profile.location} />
              <ProfileDetail label="Bio" value={profile.bio} />
              <ProfileDetail
                label="Member since"
                value={
                  profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : null
                }
              />
              <ProfileDetail
                label="Email status"
                value={profile.emailVerified ? "Verified" : "Unverified"}
              />
            </dl>
          )}
        </div>
      </section>

      <section
        className="space-y-4"
        aria-labelledby="learning-progress-heading"
      >
        <h2
          id="learning-progress-heading"
          className="font-display text-h3 font-semibold text-ink"
        >
          Learning progress
        </h2>
        {progressItems.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {progressItems.map(([key, label]) => (
              <div key={key} className="border border-line bg-surface p-4">
                <dt className="text-micro font-semibold uppercase text-ink-faint">
                  {label}
                </dt>
                <dd className="mt-2 font-mono text-h2 font-bold text-ink tabular-nums">
                  {key === "overallMastery"
                    ? `${progress[key]}%`
                    : progress[key]}
                </dd>
              </div>
            ))}
          </div>
        ) : (
          <p
            className="border-l-2 border-line-strong py-2 pl-3 text-caption text-ink-muted"
            role="status"
          >
            {progressUnavailable
              ? "Progress statistics are not available yet."
              : "No progress statistics have been recorded yet."}
          </p>
        )}
      </section>

      <section className="space-y-4" aria-labelledby="change-password-heading">
        <div className="flex items-center gap-2">
          <LockKeyhole className="h-4 w-4 text-accent" />
          <h2
            id="change-password-heading"
            className="font-display text-h3 font-semibold text-ink"
          >
            Change password
          </h2>
        </div>
        <form
          onSubmit={savePassword}
          className="card grid grid-cols-1 gap-4 p-5 md:grid-cols-3"
          noValidate
        >
          <ProfileField
            id="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={passwordForm.currentPassword}
            error={passwordErrors.currentPassword}
            onChange={(value) =>
              setPasswordForm((current) => ({
                ...current,
                currentPassword: value,
              }))
            }
          />
          <ProfileField
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={passwordForm.newPassword}
            error={passwordErrors.newPassword}
            onChange={(value) =>
              setPasswordForm((current) => ({ ...current, newPassword: value }))
            }
          />
          <ProfileField
            id="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={passwordForm.confirmPassword}
            error={passwordErrors.confirmPassword}
            onChange={(value) =>
              setPasswordForm((current) => ({
                ...current,
                confirmPassword: value,
              }))
            }
          />
          <div className="md:col-span-3 flex justify-end border-t border-line pt-4">
            <button
              type="submit"
              disabled={passwordSaving}
              className="btn-ghost min-h-10 border border-line px-4 text-caption font-semibold text-ink focus-ring disabled:opacity-50"
            >
              {passwordSaving ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </section>

      <section
        className="space-y-4 border-t border-state-swap/30 pt-5"
        aria-labelledby="danger-zone-heading"
      >
        <div className="flex items-center gap-2 text-state-swap">
          <AlertTriangle className="h-4 w-4" />
          <h2
            id="danger-zone-heading"
            className="font-display text-h3 font-semibold"
          >
            Danger zone
          </h2>
        </div>
        <div className="flex flex-col justify-between gap-4 border border-state-swap/30 bg-surface p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold text-ink">Delete account</h3>
            <p className="mt-1 text-caption text-ink-muted">
              This permanently removes your account and cannot be undone.
            </p>
          </div>
          <button
            ref={deleteTriggerRef}
            type="button"
            onClick={() => {
              setDeleteError("");
              setDeletePassword("");
              setDeleteOpen(true);
            }}
            className="btn-ghost min-h-10 border border-state-swap px-4 text-caption font-semibold text-state-swap focus-ring"
          >
            Delete account
          </button>
        </div>
      </section>

      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/50"
            onClick={() => setDeleteOpen(false)}
            aria-label="Close delete account dialog"
          />
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-heading"
            className="relative z-10 w-full max-w-md space-y-4 border border-line bg-surface p-5 shadow-e3"
          >
            <div>
              <h2
                id="delete-dialog-heading"
                className="font-display text-h3 font-semibold text-ink"
              >
                Confirm account deletion
              </h2>
              <p className="mt-1 text-caption text-ink-muted">
                Enter your password to permanently delete this account.
              </p>
            </div>
            <form onSubmit={deleteAccount} className="space-y-4">
              <ProfileField
                id="deletePassword"
                label="Password"
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                error={deleteError}
                onChange={(value) => {
                  setDeletePassword(value);
                  setDeleteError("");
                }}
              />
              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleting}
                  className="btn-ghost min-h-10 border border-line px-3 text-caption font-medium focus-ring"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="btn-ghost min-h-10 border border-state-swap bg-state-swap px-3 text-caption font-semibold text-white focus-ring disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete permanently"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function ProfileField({
  id,
  label,
  value,
  onChange,
  error,
  as = "input",
  children,
  ...inputProps
}) {
  const Component = as;
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={id} className="block text-caption font-medium text-ink">
        {label}
      </label>
      <Component
        id={id}
        value={value}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="min-h-10 w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-body text-ink focus-ring read-only:bg-sunken read-only:text-ink-muted"
        {...inputProps}
      >
        {as === "select" ? children : undefined}
      </Component>
      {error && (
        <p
          id={`${id}-error`}
          className="text-caption text-state-swap"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function ProfileDetail({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-micro font-semibold uppercase text-ink-faint">
        {label}
      </dt>
      <dd className="mt-1 wrap-break-word text-body text-ink">
        {value || <span className="text-ink-faint">Not provided</span>}
      </dd>
    </div>
  );
}
