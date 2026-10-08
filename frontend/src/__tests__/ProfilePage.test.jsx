// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import App from "../App";
import { AuthProvider } from "../context/AuthContext";
import { ZenProvider } from "../context/ZenContext";
import Navbar from "../components/layout/Navbar";
import ProfilePage from "../pages/ProfilePage";
import authApi from "../services/authApi";
import profileApi from "../services/profileApi";
import tokenStore from "../services/tokenStore";

const account = {
  id: 17,
  email: "ada@example.com",
  emailVerified: true,
  displayName: "Ada Lovelace",
  bio: "Learning algorithms",
  avatarUrl: null,
  college: "Analytical Engine Institute",
  studyYear: 2,
  location: "London",
  createdAt: "2026-01-01T00:00:00Z",
};

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={["/profile"]}>
      <ZenProvider>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<h1>Home destination</h1>} />
          </Routes>
        </AuthProvider>
      </ZenProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  tokenStore.set("test-token");
  vi.spyOn(authApi, "me").mockResolvedValue({ data: account });
  vi.spyOn(authApi, "logout").mockResolvedValue({ data: null });
  vi.spyOn(profileApi, "get").mockResolvedValue({ data: account });
  vi.spyOn(profileApi, "getProgress").mockRejectedValue(
    new Error("Progress endpoint unavailable"),
  );
  vi.spyOn(profileApi, "update").mockImplementation(async (payload) => ({
    data: { ...account, ...payload },
  }));
  vi.spyOn(profileApi, "changePassword").mockResolvedValue({ data: null });
  vi.spyOn(profileApi, "deleteAccount").mockResolvedValue({ data: null });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("ProfilePage", () => {
  it("renders account details and handles the missing progress API state", async () => {
    renderProfile();
    expect(
      await screen.findByRole("link", {
        name: "Open profile for Ada Lovelace",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Analytical Engine Institute")).toBeTruthy();
    expect(
      screen.getByText("Progress statistics are not available yet."),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Open profile for Ada Lovelace" }),
    ).toBeTruthy();
  });

  it("edits and saves profile details and immediately updates the navbar", async () => {
    renderProfile();
    await screen.findByRole("link", { name: "Open profile for Ada Lovelace" });
    fireEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Display name" }), {
      target: { value: "Ada Byron" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Profile saved.")).toBeTruthy();
    expect(profileApi.update).toHaveBeenCalledWith({
      displayName: "Ada Byron",
      bio: "Learning algorithms",
      avatarUrl: null,
      college: "Analytical Engine Institute",
      studyYear: 2,
      location: "London",
    });
    expect(
      screen.getByRole("link", { name: "Open profile for Ada Byron" }),
    ).toBeTruthy();
  });

  it("shows inline validation errors and does not submit invalid profile data", async () => {
    renderProfile();
    await screen.findByRole("link", { name: "Open profile for Ada Lovelace" });
    fireEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Avatar URL" }), {
      target: { value: "javascript:alert(1)" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      screen.getByText("Enter a valid URL beginning with http:// or https://."),
    ).toBeTruthy();
    expect(profileApi.update).not.toHaveBeenCalled();
  });

  it("cancel restores the saved profile values", async () => {
    renderProfile();
    await screen.findByRole("link", { name: "Open profile for Ada Lovelace" });
    fireEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Display name" }), {
      target: { value: "Unsaved name" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.getByRole("link", { name: "Open profile for Ada Lovelace" }),
    ).toBeTruthy();
    expect(screen.queryByText("Unsaved name")).toBeNull();
  });

  it("warns before internal navigation with unsaved edits", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderProfile();
    await screen.findByRole("link", { name: "Open profile for Ada Lovelace" });
    fireEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Display name" }), {
      target: { value: "Unsaved name" },
    });
    fireEvent.click(screen.getByRole("link", { name: "Home" }));

    expect(confirm).toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Your profile" })).toBeTruthy();
  });

  it("warns before browser history navigation with unsaved edits", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderProfile();
    await screen.findByRole("link", { name: "Open profile for Ada Lovelace" });
    fireEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Display name" }), {
      target: { value: "Unsaved name" },
    });
    fireEvent(window, new PopStateEvent("popstate"));

    expect(confirm).toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Your profile" })).toBeTruthy();
  });

  it("traps keyboard focus in the delete dialog and closes it with Escape", async () => {
    renderProfile();
    await screen.findByRole("link", { name: "Open profile for Ada Lovelace" });
    const openButton = screen.getByRole("button", { name: "Delete account" });
    fireEvent.click(openButton);
    const passwordInput = screen.getByLabelText("Password");
    expect(document.activeElement).toBe(passwordInput);

    fireEvent.keyDown(passwordInput, { key: "Tab", shiftKey: true });
    const deleteButton = screen.getByRole("button", {
      name: "Delete permanently",
    });
    expect(document.activeElement).toBe(deleteButton);
    fireEvent.keyDown(deleteButton, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(openButton);
  });

  it("protects the route when no authenticated user is present", async () => {
    localStorage.clear();
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <ZenProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ZenProvider>
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: /Sign in to/ }),
    ).toBeTruthy();
  });
});
