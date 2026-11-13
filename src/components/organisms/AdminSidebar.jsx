import React, { useEffect, useRef, useState, useCallback } from 'react';
import Icon from '../atoms/Icon';
import { ADMIN_NAV_ITEMS } from '../../data/adminNavItems';

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';

/**
 * AdminSidebar Organism
 * Responsive navigation: persistent sidebar on desktop (>= 1024px)
 * and swipeable modal-like popover drawer on mobile (< 1024px).
 */
export default function AdminSidebar({
  activeSection,
  onSelectSection,
  isDrawerOpen,
  onDrawerOpenChange,
  openBtnRef,
  setPageInert,
  registerOpenDrawer,
}) {
  const drawerRef = useRef(null);
  const scrollerRef = useRef(null);
  const sheetRef = useRef(null);
  const closeBtnRef = useRef(null);
  const isOpenRef = useRef(false);

  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_MEDIA_QUERY).matches : true
  );

  const closeDrawer = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'auto' });
  }, []);

  const openDrawer = useCallback(async () => {
    const drawer = drawerRef.current;
    const scroller = scrollerRef.current;
    if (!drawer || !scroller || isDesktop) return;

    drawer.showPopover();
    setPageInert(true);
    drawer.setAttribute('aria-modal', 'true');
    isOpenRef.current = true;
    onDrawerOpenChange(true);

    if (!CSS.supports('scroll-initial-target', 'nearest')) {
      scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'instant' });
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );
    }

    scroller.scrollTo({ left: 0, behavior: 'auto' });
    closeBtnRef.current?.focus({ preventScroll: true });
  }, [isDesktop, onDrawerOpenChange, setPageInert]);

  useEffect(() => {
    registerOpenDrawer(openDrawer);
  }, [registerOpenDrawer, openDrawer]);

  const finishClose = useCallback(
    (restoreFocus = true) => {
      const drawer = drawerRef.current;
      if (!drawer || !isOpenRef.current) return;

      isOpenRef.current = false;
      try {
        drawer.hidePopover();
      } catch {
        // Ignore if popover is already closed
      }
      setPageInert(false);
      drawer.removeAttribute('aria-modal');
      onDrawerOpenChange(false);

      if (restoreFocus) {
        openBtnRef.current?.focus();
      }
    },
    [onDrawerOpenChange, openBtnRef, setPageInert]
  );

  // Track desktop vs mobile breakpoint and reset drawer state when switching to desktop
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleChange = (event) => {
      setIsDesktop(event.matches);
      if (event.matches && isOpenRef.current) {
        finishClose(false);
      }
    };

    setIsDesktop(mql.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [finishClose]);

  // IntersectionObserver to sync open/closed state with swipe & programmatic scroll
  useEffect(() => {
    const drawer = drawerRef.current;
    const sheet = sheetRef.current;
    if (!drawer || !sheet || isDesktop) return undefined;

    const visibleThreshold = 1 / Math.max(window.innerWidth, 1);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry) return;
        if (entry.intersectionRatio < visibleThreshold) {
          finishClose(true);
        } else if (entry.intersectionRatio === 1 && isOpenRef.current) {
          onDrawerOpenChange(true);
        }
      },
      { root: drawer, threshold: [visibleThreshold, 1] }
    );

    observer.observe(sheet);
    return () => observer.disconnect();
  }, [isDesktop, finishClose, onDrawerOpenChange]);

  // Backdrop fade fallback when CSS scroll-driven animations are unsupported
  useEffect(() => {
    const drawer = drawerRef.current;
    const scroller = scrollerRef.current;
    const sheet = sheetRef.current;
    if (!drawer || !scroller || !sheet || isDesktop) return undefined;
    if (CSS.supports('animation-timeline: scroll()')) return undefined;

    const handleScroll = () => {
      const width = sheet.offsetWidth || 1;
      const ratio = Math.max(0, Math.min(1, 1 - scroller.scrollLeft / width));
      drawer.style.setProperty('--drawer-backdrop', String(ratio));
    };

    scroller.addEventListener('scroll', handleScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', handleScroll);
  }, [isDesktop]);

  // Escape key dismissal while drawer is open on mobile
  useEffect(() => {
    if (!isDrawerOpen || isDesktop) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, isDesktop, closeDrawer]);

  const handleDrawerClick = (event) => {
    if (isDesktop) return;
    if (sheetRef.current && !sheetRef.current.contains(event.target)) {
      closeDrawer();
    }
  };

  const handleSelectItem = (sectionId) => {
    onSelectSection(sectionId);
    if (!isDesktop) {
      closeDrawer();
    }
  };

  return (
    <aside
      id="admin-drawer"
      ref={drawerRef}
      popover={isDesktop ? undefined : 'manual'}
      role={isDesktop ? undefined : 'dialog'}
      aria-label="Menú de administración"
      onClick={handleDrawerClick}
      className="AdminDrawer"
    >
      <div ref={scrollerRef} className="AdminDrawer-scroller">
        <nav
          ref={sheetRef}
          aria-label="Navegación de administración"
          className="AdminDrawer-sheet flex flex-col bg-surface-container-low lg:rounded-2xl border-r lg:border border-surface-container-high/80 shadow-lg lg:shadow-xs p-4"
        >
          {/* Mobile drawer header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container-high/70 lg:hidden">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] uppercase tracking-widest text-secondary font-semibold">
                Administración
              </span>
              <span className="font-headline-sm text-[16px] font-semibold text-primary">
                Emuná Pilates
              </span>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeDrawer}
              aria-label="Cerrar menú"
              className="w-9 h-9 rounded-full inline-flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>

          {/* Desktop section label */}
          <div className="hidden lg:block px-3 pb-2 mb-2 border-b border-surface-container-high/60">
            <span className="font-label-sm text-[10px] uppercase tracking-widest text-secondary font-semibold">
              Menú Principal
            </span>
          </div>

          <ul className="space-y-1 flex-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectItem(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container-high/70 hover:text-primary font-medium'
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      filled={isActive}
                      className={`text-[20px] shrink-0 ${
                        isActive ? 'text-on-secondary-container' : 'text-secondary'
                      }`}
                    />
                    <span className="font-label-lg text-[14px] leading-snug truncate">
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
