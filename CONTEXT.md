# 🤖 CONTEXT.md - Guía de Contexto y Estándares para Agentes de Código

Este documento establece el contexto operativo, reglas de negocio, directivas de arquitectura y buenas prácticas de codificación para cualquier agente de IA o desarrollador que genere o refactorice código en el proyecto **Emuná Pilates**[span_43](start_span)[span_43](end_span)[span_44](start_span)[span_44](end_span).

---

## 1. Misión del Proyecto y Roles

El objetivo es desarrollar la plataforma web de gestión para **Emuná Pilates**, un estudio con cupo físico de **4 camas reformer**[span_45](start_span)[span_45](end_span)[span_46](start_span)[span_46](end_span).
Existen dos roles bien diferenciados:
- **`alumno`**: Visualiza calendario en tiempo real, reserva camas, cancela con hasta 2 hs de anticipación y consulta su saldo de clases[span_47](start_span)[span_47](end_span)[span_48](start_span)[span_48](end_span).
- **`administradora`**: Visualiza matriz horaria de 4 camas, realiza check-in (presente/ausente), gestiona recuperos manuales y valida comprobantes de pago[span_49](start_span)[span_49](end_span)[span_50](start_span)[span_50](end_span).

---

## 2. Reglas de Negocio Críticas (Inviolables en Backend y Frontend)

1. **Restricción de Cupo Concurrente:** Un turno nunca puede exceder 4 reservas activas. Toda reserva debe resolverse mediante transacciones atómicas (`runTransaction` en Firestore) para evitar sobreventa o condiciones de carrera
2. **Ventana de Cancelación (2 Horas):**
   ```ts
   // Ejemplo conceptual de validación
   const deltaHoras = (turno.fechaHoraInicio.toMillis() - Date.now()) / (1000 * 60 * 60);
   if (deltaHoras < 2) {
     // No libera crédito automáticamente; registra ausencia/clase perdida
     throw new BusinessRuleError("Cancelación fuera de término (< 2 horas).");
   }
3. Paquetes Móviles: Paquetes de 4, 8, 12 o 20 clases con vigencia que corre desde la fecha de alta/asignación. Permite arrastre de remanente al ciclo siguiente según acuerdos comerciales.
4. Pagos: El sistema no cobra por pasarelas automáticas; registra transacciones pendientes para que la administradora concilie transferencias bancarias de forma manual.

## 3. Arquitectura Frontend: Reutilización y Atomic Design
Todo código frontend debe adherirse al principio de máxima reutilización y estructuración por componentes jerárquicos:
### Estructura de Componentes
- Átomos (src/components/atoms/): Elementos mínimos indivisibles con estilos consistentes.
Ejemplos: Button, Badge (verde para cupo disponible, gris para completo), Avatar, Input, Spinner.
- Moléculas (src/components/molecules/): Combinación de átomos para una función simple.
Ejemplos: BedSlotBadge (muestra camas 1..4 libres/ocupadas), DatePickerItem, PackageCardSummary, ChatMessageBubble.
- Organismos (src/components/organisms/): Secciones complejas con lógica de interacción.
Ejemplos: ClassScheduleGrid, TurnDetailPanel, ChatbotDrawer, CheckInList, AdminSidebar.
- Plantillas / Layouts (src/layouts/): Estructuras base reutilizables (AuthLayout, DashboardLayout, StudentLayout).
- Vistas / Páginas (src/pages/): Vistas finales que ensamblan organismos y consumen hooks/contextos.
### Reglas de Reutilización
- No duplicar lógica de formateo: Usar helpers para fechas (formato local de Argentina es-AR), estados de reserva y badges de cupos.
- Separación de responsabilidades: Mantener la lógica de Firestore y llamadas API dentro de hooks personalizados (useBookings, useMemberships, useSlots) desacoplados de la UI.

## 4. Control de Salud y Calidad del Código (React Doctor)
### ⚠️ DIRECTIVA OBLIGATORIA:
Antes de dar por finalizada cualquier funcionalidad o refactor en React, se debe verificar el estado y buenas prácticas del árbol de componentes.

Ejecutar React Doctor: Comprobar la salud del código según los estándares de la librería:
```bash
npx react-doctor@latest .
# o el script configurado en package.json
npm run doctor
```
### Criterios a cumplir:
* Cero advertencias de dependencias en useEffect / useCallback / useMemo.
* Ningún render innecesario por re-creación de funciones o referencias en props.
* Cumplimiento estricto del estándar de accesibilidad básica (etiquetas aria-*, inputs asociados a labels).
* Código limpio sin variables, imports o componentes obsoletos no utilizados.
## 5. Colecciones de Datos Principales (Cloud Firestore)
- usuarios: Datos del usuario, rol (alumno | administradora) y estado.
- turnos_clase: Franjas horarias con cupo_maximo (fijo en 4), cupo_disponible (0 a 4) y estado.
- reservas: Vínculo entre alumno, turno y membresía, con estado (confirmada, cancelada_a_tiempo, clase_perdida, etc.) y limite_cancelacion.
- paquetes_catalogo: Definición de paquetes de 4, 8, 12 y 20 clases con sus vigencias.
- membresias_usuario: Saldo activo, créditos restantes y vencimiento móvil.
- pagos: Registro de transferencias manuales pendientes y aprobadas.
## 6. Asistente Conversacional (Google Gemini API)
El chatbot atiende exclusivamente consultas sobre:
- Ubicación y contacto de Emuná Pilates en Resistencia.
- Catálogo de paquetes y políticas de asistencia/cancelación (2 hs de margen).
- Consulta orientativa de franjas horarias y disponibilidad.
Siempre debe mantener un tono cordial, empático y sintético, derivando a la administradora ante excepciones complejas de fuerza mayor. Cualquier consulta fuera de lo que es el funcionamiento o referido a Emuná pilates debe ser ignorado mencionando que solo se responden consultas del salon de pilates.
