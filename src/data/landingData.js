/**
 * Initial data models matching CONTEXT.md Firestore schema structures
 * Prepares the application for upcoming Cloud Firestore integration
 */

export const STUDIO_INFO = {
  name: 'Emuná Pilates',
  tagline: 'Estudio Pilates Reformer',
  city: 'Resistencia, Chaco',
  address: 'Fray Luis Beltrán 245, H3500 Resistencia, Chaco',
  addressReference: 'Frente a plazoleta arbolada • Fácil estacionamiento',
  phone: '+54 362 489-0123',
  whatsappUrl: 'https://wa.me/543624890123?text=Hola!%20Quisiera%20consultar%20por%20clases%20de%20Pilates%20Reformer%20en%20Emun%C3%A1',
  email: 'info@emunapilates.com',
  instagram: '@emuna.estudiopilates',
  maxBedsPerSlot: 4,
  classDurationMinutes: 55,
  cancelationWindowHours: 2, // Conforme regla estricta de CONTEXT.md
  hours: {
    weekdays: 'Lunes a Viernes: 07:00 a 21:00 hs',
    saturday: 'Sábados: 08:30 a 13:00 hs',
  },
};

export const METRICS = [
  {
    title: '4 camas',
    description: 'Cupo estricto por turno',
  },
  {
    title: '55 min',
    description: 'Duración de clase consciente',
  },
  {
    title: '100%',
    description: 'Kinesiólogas e instructoras cert.',
  },
  {
    title: 'App Móvil',
    description: 'Gestión ágil de turnos y créditos',
  },
];

export const METHODOLOGY_PILLARS = [
  {
    icon: 'accessibility_new',
    numberLabel: '01 • Biomecánica',
    title: 'Alineación Postural',
    description:
      'Evaluamos la pisada, la pelvis y las curvaturas espinales antes y durante cada movimiento para corregir patrones viciosos y aliviar contracturas.',
    featureTag: 'Alineación guiada',
  },
  {
    icon: 'fitness_center',
    numberLabel: '02 • Fuerza Saludable',
    title: 'Tonificación Sin Impacto',
    description:
      'La resistencia progresiva de resortes alemanes fortalece el núcleo profundo y alarga la musculatura sin sobrecargar articulaciones ni ligamentos.',
    featureTag: 'Cero estrés articular',
  },
  {
    icon: 'air',
    numberLabel: '03 • Fisiología',
    title: 'Respiración & Control',
    description:
      'Patrones diafragmáticos combinados con concentración motriz. Reducí los niveles de cortisol y recuperá el balance neurovegetativo mientras entrenás.',
    featureTag: 'Oxigenación profunda',
  },
  {
    icon: 'spa',
    numberLabel: '04 • Entorno',
    title: 'Atmósfera Consciente',
    description:
      'Iluminación cálida indirecta, aromas botánicos naturales y climatización silenciosa pensada para desconectar del ruido urbano desde el primer minuto.',
    featureTag: 'Acústica tratada',
  },
];

export const PACKAGES_CATALOG = [
  {
    id: 'plan-4',
    category: 'Inicial / Mantenimiento',
    name: '4 Clases',
    frequency: '1 vez por semana',
    price: '$24.000',
    numericPrice: 24000,
    classesCount: 4,
    features: [
      '1 clase semanal fija o móvil',
      'Cancelación flexible (hasta 2 hs antes)',
      'Vigencia 30 días corridos desde el alta',
    ],
    isPopular: false,
  },
  {
    id: 'plan-8',
    category: 'Recomendado',
    name: '8 Clases',
    frequency: '2 veces por semana',
    price: '$38.500',
    numericPrice: 38500,
    classesCount: 8,
    features: [
      '2 clases por semana',
      'Recuperación de inasistencias',
      'Prioridad en reserva de horarios pico',
      'Evaluación postural inicial s/cargo',
    ],
    isPopular: true,
  },
  {
    id: 'plan-12',
    category: 'Intensivo & Postural',
    name: '12 Clases',
    frequency: '3 veces por semana',
    price: '$49.000',
    numericPrice: 49000,
    classesCount: 12,
    features: [
      '3 clases por semana',
      'Recuperación de hasta 3 ausencias',
      'Acceso a talleres mensuales especiales',
    ],
    isPopular: false,
  },
  {
    id: 'plan-20',
    category: 'Full Inmersión',
    name: '20 Clases',
    frequency: 'Lunes a Viernes diario',
    price: '$68.000',
    numericPrice: 68000,
    classesCount: 20,
    features: [
      'Entrenamiento diario continuo',
      'Máxima flexibilidad de franjas horarias',
      'Locker fijo personalizado en el estudio',
    ],
    isPopular: false,
  },
];

export const SCHEDULE_GRID_DATA = {
  days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
  rows: [
    {
      time: '07:00 hs',
      slots: [
        { discipline: 'Reformer Suave', availableBeds: 1 },
        { discipline: 'Alineación', availableBeds: 2 },
        { discipline: 'Reformer Suave', availableBeds: 0 },
        { discipline: 'Alineación', availableBeds: 1 },
        { discipline: 'Reformer Core', availableBeds: 3 },
      ],
    },
    {
      time: '09:00 hs',
      slots: [
        { discipline: 'Postural Dinámico', availableBeds: 2 },
        { discipline: 'Reformer Clásico', availableBeds: 0 },
        { discipline: 'Postural Dinámico', availableBeds: 1 },
        { discipline: 'Reformer Clásico', availableBeds: 2 },
        { discipline: 'Postural Estiramiento', availableBeds: 1 },
      ],
    },
    {
      time: '18:00 hs',
      slots: [
        { discipline: 'Reformer Integral', availableBeds: 0 },
        { discipline: 'Fuerza & Control', availableBeds: 1 },
        { discipline: 'Reformer Integral', availableBeds: 0 },
        { discipline: 'Fuerza & Control', availableBeds: 2 },
        { discipline: 'Reformer Tono', availableBeds: 0 },
      ],
    },
    {
      time: '19:30 hs',
      slots: [
        { discipline: 'Descompresión', availableBeds: 2 },
        { discipline: 'Reformer Intenso', availableBeds: 1 },
        { discipline: 'Descompresión', availableBeds: 3 },
        { discipline: 'Reformer Intenso', availableBeds: 0 },
        { discipline: 'Relajación Guiada', availableBeds: 2 },
      ],
    },
  ],
};

/**
 * Predefined assistant QA responses aligning with CONTEXT.md Section 6
 * "El chatbot atiende exclusivamente consultas sobre:
 * - Ubicación y contacto de Emuná Pilates en Resistencia.
 * - Catálogo de paquetes y políticas de asistencia/cancelación (2 hs de margen).
 * - Consulta orientativa de franjas horarias y disponibilidad."
 */
export const ASSISTANT_PRESETS = [
  {
    label: '¿Cuál es la política de cancelación?',
    query: '¿Con cuánta anticipación puedo cancelar?',
    response:
      'En Emuná podés cancelar tu turno hasta 2 horas antes de la clase para que el crédito se reintegre automáticamente a tu paquete móvil. Las cancelaciones con menos de 2 horas registran la clase como consumida para preservar el cupo físico de 4 camas.',
  },
  {
    label: '¿Dónde están ubicados?',
    query: '¿Dónde queda el estudio y cómo llego?',
    response:
      'Nos encontramos en Fray Luis Beltrán 245, Resistencia, Chaco (frente a la plazoleta arbolada). La zona es tranquila, con veredas amplias y cómodo estacionamiento.',
  },
  {
    label: '¿Cuáles son los paquetes y precios?',
    query: '¿Qué planes mensuales ofrecen?',
    response:
      'Ofrecemos 4 paquetes con vigencia móvil de 30 días corridos desde tu primera clase:\n• 4 Clases: $24.000 / mes (1x sem)\n• 8 Clases: $38.500 / mes (2x sem - Más elegido)\n• 12 Clases: $49.000 / mes (3x sem)\n• 20 Clases: $68.000 / mes (pase diario)\nPago por transferencia manual, débito o crédito sin recargo.',
  },
  {
    label: '¿Cuántos alumnos hay por turno?',
    query: '¿Cuál es el cupo máximo por turno?',
    response:
      'Cada turno cuenta con un cupo estricto de hasta 4 camas reformer en madera de guatambú, garantizando corrección postural guiada y atención de nuestras kinesiólogas e instructoras certificadas.',
  },
];
