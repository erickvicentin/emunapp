/**
 * Navigation items for the Administrator Panel sidebar.
 */
export const ADMIN_NAV_ITEMS = [
  {
    id: 'dashboard',
    path: '/administrador/dashboard',
    label: 'Dashboard general',
    icon: 'dashboard',
    description: 'Vista general de la sala, ocupación de camas y conciliación de pagos.',
  },
  {
    id: 'calendario',
    path: '/administrador/calendario',
    label: 'Calendario',
    icon: 'calendar_month',
    description: 'Gestión de horarios, turnos y disponibilidad de las 4 camas reformer.',
  },
  {
    id: 'alumnos',
    path: '/administrador/alumnos',
    label: 'Alumnos',
    icon: 'groups',
    description: 'Listado de alumnas, fichas, asistencias y créditos vigentes.',
  },
  {
    id: 'cobros',
    path: '/administrador/cobros',
    label: 'Cobros',
    icon: 'payments',
    description: 'Historial de pagos, transferencias recibidas y acreditaciones.',
  },
  {
    id: 'precios',
    path: '/administrador/precios',
    label: 'Precios y Paquetes',
    icon: 'sell',
    description: 'Configuración de membresías, valores y paquetes de clases.',
  },
  {
    id: 'usuarios',
    path: '/administrador/usuarios',
    label: 'Usuarios (staff)',
    icon: 'manage_accounts',
    description: 'Administración de instructoras, roles y permisos del equipo.',
  },
];
