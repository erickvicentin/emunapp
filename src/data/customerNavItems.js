/**
 * Navigation items for the Customer (Alumno) Panel sidebar.
 */
export const CUSTOMER_NAV_ITEMS = [
  {
    id: 'turnos',
    path: '/customer/turnos',
    label: 'Turnos',
    icon: 'calendar_month',
    description: 'Reservá y gestioná tus próximos turnos en las 4 camas reformer.',
  },
  {
    id: 'paquetes',
    path: '/customer/paquetes',
    label: 'Paquetes',
    icon: 'inventory_2',
    description: 'Explorá los paquetes de clases disponibles y reservá créditos.',
  },
  {
    id: 'pagos',
    path: '/customer/pagos',
    label: 'Pagos',
    icon: 'payments',
    description: 'Consultá tu saldo de clases, avisos de pago y comprobantes.',
  },
  {
    id: 'historial',
    path: '/customer/historial',
    label: 'Historial de Clases',
    icon: 'history',
    description: 'Revisá el detalle de tus asistencias y clases realizadas.',
  },
  {
    id: 'configuracion',
    path: '/customer/configuracion',
    label: 'Configuración',
    icon: 'settings',
    description: 'Visualizá y actualizá tus datos personales y de contacto.',
  },
];
