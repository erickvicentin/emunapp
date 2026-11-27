import React from 'react';
import DashboardSidebar from './DashboardSidebar';
import { ADMIN_NAV_ITEMS } from '../../data/adminNavItems';

/**
 * AdminSidebar Organism
 * Wraps DashboardSidebar with role-filtered administration navigation items.
 */
export default function AdminSidebar({
  userRole = 'staff',
  ...sidebarProps
}) {
  const visibleNavItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.adminOnly || userRole === 'administradora'
  );

  return (
    <DashboardSidebar
      {...sidebarProps}
      navItems={visibleNavItems}
      drawerId="admin-drawer"
      testIdPrefix="admin"
      ariaLabel="Menú de administración"
      navAriaLabel="Navegación de administración"
      mobileHeaderSubtitle="Administración"
    />
  );
}
