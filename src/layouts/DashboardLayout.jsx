import React, { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/atoms/Icon";
import logo from "../assets/logo.jpeg";
import { useAuth } from "../hooks/useAuth";

function DashboardHeaderBadge({ badgeLabel, badgeIcon, effectiveBadge }) {
  const iconName =
    badgeIcon || (effectiveBadge === "staff" ? "admin_panel_settings" : "spa");
  const label = badgeLabel || `Rol: ${effectiveBadge}`;
  const badgeClasses =
    effectiveBadge === "staff"
      ? "bg-secondary-container text-on-secondary-container"
      : "bg-surface-container-highest text-primary";

  return (
    <span
      data-testid="dashboard-header-badge"
      className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 ${badgeClasses}`}
    >
      <Icon name={iconName} className="text-[14px] shrink-0" />
      <span>{label}</span>
    </span>
  );
}

/**
 * DashboardLayout
 * Layout for authenticated role panels (/customer, /administrator)
 */
export default function DashboardLayout({
  children,
  roleName = "Cliente",
  roleBadge = "customer",
  userName,
  userEmail,
  badgeLabel,
  badgeIcon,
  sidebarId = "admin-drawer",
  renderSidebar,
}) {
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();

  const headerRef = useRef(null);
  const mainRef = useRef(null);
  const footerRef = useRef(null);
  const openBtnRef = useRef(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const handleDrawerOpenChange = useCallback((nextOpen) => {
    setIsDrawerOpen(nextOpen);
    if (headerRef.current) headerRef.current.inert = nextOpen;
    if (mainRef.current) mainRef.current.inert = nextOpen;
    if (footerRef.current) footerRef.current.inert = nextOpen;
  }, []);

  const handleMenuToggle = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      setIsDesktopCollapsed((prev) => !prev);
    } else {
      handleDrawerOpenChange(true);
    }
  };

  const effectiveName =
    userName || userProfile?.nombre || user?.displayName || "Usuario";
  const effectiveEmail =
    userEmail || userProfile?.email || user?.email || roleName;
  const effectiveBadge = userProfile?.rol || roleBadge;
  const photoURL = userProfile?.photoURL || user?.photoURL;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface antialiased selection:bg-secondary-fixed selection:text-secondary-fixed-variant">
      {/* Top Bar Navigation */}
      <header
        ref={headerRef}
        className="py-1.5 sm:py-3 sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container-high/60 shadow-xs"
      >
        <div className="w-full px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Mobile & desktop menu trigger + Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {renderSidebar && (
              <button
                ref={openBtnRef}
                type="button"
                data-testid="dashboard-menu-toggle-btn"
                onClick={handleMenuToggle}
                aria-label="Alternar menú principal"
                aria-expanded={isDrawerOpen || !isDesktopCollapsed}
                aria-controls={sidebarId}
                className="w-9 h-9 sm:w-10 sm:h-10 -ml-1 rounded-full inline-flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors cursor-pointer shrink-0"
              >
                <Icon name="menu" className="text-[22px]" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
              <img
                src={logo}
                alt="Logo Emuná"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shadow-xs transition-transform group-hover:scale-105 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-[15px] sm:text-[17px] font-semibold text-primary tracking-tight whitespace-nowrap truncate">
                  Emuná Pilates
                </span>
                <span className="hidden sm:block font-label-sm text-[10px] uppercase text-secondary tracking-widest font-semibold whitespace-nowrap">
                  Panel de Gestión
                </span>
              </div>
            </Link>
          </div>

          {/* User info & role/credits badge */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <DashboardHeaderBadge
              badgeLabel={badgeLabel}
              badgeIcon={badgeIcon}
              effectiveBadge={effectiveBadge}
            />

            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-surface-container-high">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={effectiveName}
                  className="w-9 h-9 rounded-full object-cover shadow-xs border border-white"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shadow-xs">
                  {effectiveName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="font-label-md text-label-md font-semibold text-primary leading-tight">
                  {effectiveName}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant leading-tight">
                  {effectiveEmail.includes("dni.emuna")
                    ? `DNI: ${effectiveEmail.split("@")[0]}`
                    : effectiveEmail}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="inline-flex items-center justify-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors font-label-sm text-label-sm cursor-pointer"
            >
              <Icon name="logout" className="text-[18px] sm:text-[16px]" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <div className="flex-1 w-full flex items-stretch">
        {renderSidebar?.({
          openBtnRef,
          isDrawerOpen,
          onDrawerOpenChange: handleDrawerOpenChange,
          isDesktopCollapsed,
          onToggleDesktopCollapse: () => setIsDesktopCollapsed((prev) => !prev),
          badgeLabel,
          badgeIcon,
          effectiveBadge,
        })}
        <main
          ref={mainRef}
          className="flex-1 min-w-0 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8"
        >
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer
        ref={footerRef}
        className="w-full py-4 text-center font-label-sm text-label-sm text-on-surface-variant border-t border-surface-container-high/40"
      >
        © {new Date().getFullYear()} Emuná Estudio Pilates • Desarrollado por
        Clutch Studio Software
      </footer>
    </div>
  );
}
