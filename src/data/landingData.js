/**
 * Initial data models matching CONTEXT.md Firestore schema structures
 * Prepares the application for upcoming Cloud Firestore integration
 */

export const STUDIO_INFO = {
  name: 'Emuná Pilates',
  tagline: 'Estudio Pilates Reformer',
  city: 'Resistencia, Chaco',
  address: 'Fray Luis Beltrán 245, H3500 Resistencia, Chaco',
  addressReference: 'Zona Residencial • Fácil estacionamiento',
  mapEmbedUrl:
    'https://maps.google.com/maps?q=Fray+Luis+Beltr%C3%A1n+245,+Resistencia,+Chaco,+Argentina&t=&z=16&ie=UTF8&iwloc=&output=embed',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Fray+Luis+Beltr%C3%A1n+245,+Resistencia,+Chaco,+Argentina',
  phone: '+54 (3704) 578354',
  whatsappUrl: 'https://wa.me/543704578354?text=Hola!%20Quisiera%20consultar%20por%20clases%20de%20Pilates%20Reformer%20en%20Emun%C3%A1',
  email: 'info@emunapilates.com',
  instagram: '@emuna.pilatess',
  maxBedsPerSlot: 4,
  classDurationMinutes: 50,
  cancelationWindowHours: 4,
  hours: {
    weekdays: 'Lunes a Viernes: 15:30 a 21:20 hs',
  },
};

export const METRICS = [
  {
    title: '4 camas',
    description: 'Cupo estricto por turno',
  },
  {
    title: '50 min',
    description: 'Duración de clase consciente',
  },
  {
    title: 'Personalizado',
    description: 'Instructora a tu servicio',
  },
  {
    title: 'Autogestion',
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
    id: 'plan-individual',
    category: 'Clase Suelta',
    name: 'Clase Individual',
    frequency: '1 clase suelta',
    price: '$7.500',
    numericPrice: 7500,
    classesCount: 1,
    validityDays: 30,
    features: [
      '1 crédito libre para cualquier horario disponible',
      'Cancelación sin cargo hasta 4 hs antes',
      'Vigencia 30 días desde la acreditación',
    ],
    isPopular: false,
    isProtected: true,
    active: true,
    order: 1,
  },
  {
    id: 'plan-4',
    category: 'Inicial / Mantenimiento',
    name: '4 Clases',
    frequency: '1 vez por semana',
    price: '$24.000',
    numericPrice: 24000,
    classesCount: 4,
    validityDays: 30,
    features: [
      '4 créditos libres para elegir días y horarios',
      'Cancelación sin cargo hasta 4 hs antes',
      'Vigencia 30 días desde la acreditación',
    ],
    isPopular: false,
    isProtected: false,
    active: true,
    order: 2,
  },
  {
    id: 'plan-8',
    category: 'Recomendado',
    name: '8 Clases',
    frequency: '2 veces por semana',
    price: '$38.500',
    numericPrice: 38500,
    classesCount: 8,
    validityDays: 30,
    features: [
      '8 créditos libres para elegir días y horarios',
      'Cancelación sin cargo hasta 4 hs antes',
      'Vigencia 30 días desde la acreditación',
    ],
    isPopular: true,
    isProtected: false,
    active: true,
    order: 3,
  },
  {
    id: 'plan-12',
    category: 'Intensivo & Postural',
    name: '12 Clases',
    frequency: '3 veces por semana',
    price: '$49.000',
    numericPrice: 49000,
    classesCount: 12,
    validityDays: 30,
    features: [
      '12 créditos libres para elegir días y horarios',
      'Cancelación sin cargo hasta 4 hs antes',
      'Vigencia 30 días desde la acreditación',
    ],
    isPopular: false,
    isProtected: false,
    active: true,
    order: 4,
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
