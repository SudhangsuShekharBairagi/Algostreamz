import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, ChevronDown, ArrowRight, UserRound, LogOut } from "lucide-react";
import ZenToggle from "../common/ZenToggle";
import Logo from "../common/Logo";
import { SITE_LINKS, LABELS, ROUTES } from "../../config/siteLinks";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar({
  onToggleMobileSidebar,
  zenSlot,
  isZen = false,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, initialising, isAuthenticated, signOut } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const currentPath = location.pathname;
  const isLandingPage = currentPath === ROUTES.HOME;

  const [scrolled, setScrolled] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState("");
  const [isMobileViewport, setIsMobileViewport] = useState(() => window.innerWidth < 768);

  // 1. Scroll listener for landing page header transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobileViewport(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. IntersectionObserver to highlight active anchor on Landing Page ('/')
  useEffect(() => {
    if (!isLandingPage) return undefined;

    const sectionIds = SITE_LINKS.anchors.map((a) => a.targetId);
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveAnchor(`#${entry.target.id}`);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isLandingPage]);

  const primaryLinks = isLandingPage
    ? SITE_LINKS.anchors.slice(0, 3)
    : SITE_LINKS.primary.slice(0, 4);
  const moreLinks = isLandingPage
    ? SITE_LINKS.anchors.slice(3)
    : SITE_LINKS.primary.slice(4);

  const handleSignOut = async () => {
    await signOut();
    showToast("Signed out", "success");
    navigate(ROUTES.HOME);
  };

  const closeMoreMenu = (event) => {
    event.currentTarget.closest("details").open = false;
  };

  // Smooth scroll helper for landing anchors
  const handleAnchorClick = (e, href) => {
    if (isLandingPage && href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
      }
    }
  };

  return (
    <header
      inert={isZen ? "" : undefined}
      aria-hidden={isZen}
      className={`sticky top-0 z-30 h-14 transition-all duration-300 ease-out-custom ${
        isZen
          ? "-translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      } ${
        isLandingPage && !scrolled
          ? "bg-transparent border-transparent"
          : "bg-canvas/80 backdrop-blur-md border-b border-line"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-nowrap items-center justify-between gap-2 md:gap-3">
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {!isLandingPage && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              aria-label={LABELS.SIDEBAR_TOGGLE}
              className="md:hidden btn-ghost p-1.5 focus-ring"
            >
              <Menu className="w-5 h-5 text-ink" />
            </button>
          )}

          <Logo />
        </div>

        <nav aria-label="Main navigation" className="flex min-w-0 flex-1 items-center justify-center gap-2 xl:gap-4">
          <div className="hidden min-w-0 flex-nowrap items-center gap-2 md:flex xl:gap-4">
            {primaryLinks.map((link) => {
              const isActive = isLandingPage
                ? activeAnchor === link.href
                : currentPath === link.href ||
                  (link.href.startsWith("/visualizer") && currentPath.startsWith("/visualizer"));
              const linkClass = `relative flex shrink-0 items-center h-full whitespace-nowrap text-caption font-medium transition-colors focus-ring px-1 ${
                isActive
                  ? "text-ink font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent"
                  : "text-ink-muted hover:text-ink"
              }`;

              return isLandingPage ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className={linkClass}
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.id} to={link.href} className={linkClass}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          <details className="group relative shrink-0">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-2 py-2 text-caption font-medium text-ink-muted hover:bg-sunken hover:text-ink focus-ring [&::-webkit-details-marker]:hidden">
              More
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 min-w-48 rounded-lg border border-line bg-surface p-1.5 shadow-e3">
              {isMobileViewport && (
              <div>
                {(isLandingPage ? SITE_LINKS.anchors : SITE_LINKS.primary).map((link) => {
                  const className = "block whitespace-nowrap rounded-md px-3 py-2 text-caption font-medium text-ink-muted hover:bg-sunken hover:text-ink focus-ring";
                  return isLandingPage ? (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        handleAnchorClick(e, link.href);
                        e.currentTarget.closest("details").open = false;
                      }}
                      className={className}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.id}
                      to={link.href}
                      onClick={(e) => {
                        e.currentTarget.closest("details").open = false;
                      }}
                      className={className}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
              )}
              {!isMobileViewport && moreLinks.map((link) => {
                const className = "block whitespace-nowrap rounded-md px-3 py-2 text-caption font-medium text-ink-muted hover:bg-sunken hover:text-ink focus-ring";
                return (
                  <div key={isLandingPage ? link.href : link.id}>
                    {isLandingPage ? (
                      <a
                        href={link.href}
                        onClick={(e) => {
                          handleAnchorClick(e, link.href);
                          e.currentTarget.closest("details").open = false;
                        }}
                        className={className}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        onClick={(e) => {
                          e.currentTarget.closest("details").open = false;
                        }}
                        className={className}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                );
              })}
              <a
                href={SITE_LINKS.external.github}
                target="_blank"
                rel="noopener noreferrer"
                title="View Algostreamz on GitHub"
                className="block whitespace-nowrap rounded-md px-3 py-2 text-caption font-medium text-ink-muted hover:bg-sunken hover:text-ink focus-ring"
              >
                GitHub repository
              </a>
              {isMobileViewport && !initialising && (
                <div className="mt-1 border-t border-line pt-1">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to={ROUTES.PROFILE}
                        onClick={closeMoreMenu}
                        className="block rounded-md px-3 py-2 text-caption font-medium text-ink-muted hover:bg-sunken hover:text-ink focus-ring"
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={(event) => {
                          closeMoreMenu(event);
                          void handleSignOut();
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-caption font-medium text-ink-muted hover:bg-sunken hover:text-ink focus-ring"
                      >
                        {LABELS.SIGN_OUT}
                      </button>
                    </>
                  ) : (
                    <Link
                      to={ROUTES.LOGIN}
                      onClick={closeMoreMenu}
                      className="block rounded-md px-3 py-2 text-caption font-medium text-ink-muted hover:bg-sunken hover:text-ink focus-ring"
                    >
                      {LABELS.SIGN_IN}
                    </Link>
                  )}
                </div>
              )}
              {isMobileViewport && (
                <div className="mt-1 border-t border-line pt-1">
                  <button
                    type="button"
                    onClick={() => toggleTheme()}
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                    aria-pressed={theme === "dark"}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-caption font-medium text-ink-muted hover:bg-sunken hover:text-ink focus-ring"
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    Switch to {theme === "dark" ? "light" : "dark"} theme
                  </button>
                </div>
              )}
            </div>
          </details>
        </nav>

        {/* Far Right Action Items */}
        <div className="flex shrink-0 flex-nowrap items-center gap-1 md:gap-2">
          {!initialising && !isAuthenticated && (
            <Link
              to={ROUTES.LOGIN}
              className={`${isLandingPage ? "btn-primary" : "btn-ghost border border-line"} inline-flex min-h-10 items-center px-3 text-caption font-semibold focus-ring`}
            >
              {LABELS.SIGN_IN}
            </Link>
          )}
          {!initialising && isAuthenticated && user && (
            <>
            <Link
              to={ROUTES.PROFILE}
              aria-label={`Open profile for ${user.displayName || user.email}`}
              title="Profile"
              className="btn-ghost inline-flex min-h-10 items-center gap-2 border border-line px-2.5 text-caption font-medium text-ink-muted hover:text-ink focus-ring"
            >
              <UserRound className="h-4 w-4 text-accent" />
              <span className="hidden max-w-32 truncate lg:inline">
                {user.displayName || "Profile"}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              aria-label={LABELS.SIGN_OUT}
              title={LABELS.SIGN_OUT}
              className="btn-ghost inline-flex min-h-10 items-center gap-2 border border-line px-2.5 text-caption font-medium text-ink-muted hover:text-ink focus-ring"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">{LABELS.SIGN_OUT}</span>
            </button>
            </>
          )}
          {/* Landing CTA Button */}
          {isLandingPage ? (
            <Link
              to={ROUTES.ALGORITHMS}
              className="btn-primary flex items-center gap-1.5 text-caption font-semibold focus-ring shadow-e1"
            >
              <span>{LABELS.START_EXPLORING}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            /* Zen Toggle Button */
            <ZenToggle />
          )}

          {zenSlot}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            aria-pressed={theme === "dark"}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="btn-ghost p-2 text-ink-muted focus-ring"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

        </div>
      </div>
    </header>
  );
}
