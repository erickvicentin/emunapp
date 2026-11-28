# Architecture Decision Records (ADR) — Emuná Pilates

---

## ADR-001: Enrutamiento por URL en el Panel de Administración y Módulo de Alumnos

- **Fecha:** 2026-11-13
- **Estado:** Aceptada

### Qué se cambió
- Se migró la navegación del panel de administración (`AdminSidebar` y `AdministratorPage`) de estado local (`useState`) a rutas dedicadas con `react-router-dom` bajo `/administrador/:section` (por ejemplo `/administrador/alumnos`), manteniendo redirección desde `/administrator/*`.
- Se implementó la pantalla inicial de **Alumnos** (`StudentsSection`) con datos mockeados (`MOCK_STUDENTS`) y exportación de plantilla compatible con Excel (`studentExport.js`).
- Se dividieron `LoginForm` y `StudentsSection` en moléculas reutilizables (`LoginFormHeader`, `LoginCredentialsFields`, `LoginFormActions`, `StudentsHeader`, `StudentsTable`, `StudentDeleteDialog`).

### Por qué
- Permitir enlaces directos, navegación con historial del navegador (atrás/adelante) y mantener componentes pequeños, legibles y con puntaje de salud ≥ 95% en React Doctor.

### Pros y Contras
- **Pros:** URLs compartibles y predecibles; mejor separación de responsabilidades siguiendo Atomic Design.
- **Contras:** Requiere mantener sincronizadas las rutas definidas en `ADMIN_NAV_ITEMS` con `AdministratorPage`.

---

## ADR-002: Barra de Búsqueda Reutilizable (`SearchBar`) y Filtrado Client-Side de Alumnos

- **Fecha:** 2026-11-13
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- Se creó la molécula reutilizable `SearchBar` (`src/components/molecules/SearchBar.jsx`) componiendo los átomos `Input` y `Button`, con botón explícito **Limpiar** al final.
- Se agregó el campo `email` a los registros de `MOCK_STUDENTS` (`src/data/mockStudents.js`) para habilitar búsquedas por correo electrónico.
- Se creó `filterStudents` (`src/utils/studentFilter.js`) con normalización sin tildes (`NFD`), insensibilidad a mayúsculas/minúsculas y soporte para DNI con o sin puntos.
- Se agregó estado vacío diferenciado en `StudentsTable` (`students-empty-search`) cuando una búsqueda no arroja resultados.

### Qué se quitó
- Nada eliminado; se mantuvo el esquema actual de columnas de la tabla.

### Por qué
- Facilitar la búsqueda rápida de alumnos por nombre, apellido, DNI o email sin duplicar inputs ni lógica de UI cuando otros módulos (Cobros, Usuarios, etc.) necesiten una barra de búsqueda.

### Pros y Contras
- **Pros:** Filtrado instantáneo sin latencia de red para listados moderados; molécula `SearchBar` reutilizable en futuras tablas; tolerante a tildes y puntos en el DNI.
- **Contras:** Al integrarse con Firebase, si la colección crece a miles de documentos, el filtrado client-side deberá complementarse con paginación o consultas indexadas en Firestore.

---

## ADR-003: Suite E2E con WebdriverIO + Cucumber y `BasePage` Compartida

- **Fecha:** 2026-11-13
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- Se integró WebdriverIO + Cucumber (`wdio.conf.js`) con escenarios Gherkin en inglés (`@EMUNA-XXX`), reporte HTML personalizado con identidad de Emuná y grabación automática de video `.webm` por escenario (`tests/config/videoRecorder.js`).
- Se creó `tests/pages/base.page.js` con métodos comunes reutilizables (`clickElement`, `typeValue`, `getElementText`, `isElementDisplayed`, `waitForElement`, etc.) y se mantuvieron los `expect` exclusivamente en `tests/steps/*.steps.js`.
- Se configuraron workflows de GitHub Actions (`.github/workflows/e2e-tests.yml` y `.github/workflows/react-doctor.yml`) y umbral obligatorio ≥ 95% de React Doctor en pre-commit y PRs (`scripts/check-doctor-score.mjs`).

### Pros y Contras
- **Pros:** Pruebas desacopladas y mantenibles con evidencia visual (video + screenshots) en cada ejecución de CI.
- **Contras:** La grabación de video añade unos segundos por escenario en la ejecución E2E.

---

## ADR-004: Página de Registro de Nuevo Alumno (`/administrador/alumnos/nuevo`) y Estrategia de Activación Firebase

- **Fecha:** 2026-11-13
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- Se habilitó la ruta `/administrador/:section/:action` en `src/App.jsx` para soportar subrutas de acción dentro del panel de administración.
- Se creó el organismo `StudentCreateSection` (`src/components/organisms/StudentCreateSection.jsx`) reutilizando la molécula `RegisterProfileFields` (Nombre, Apellido, Teléfono/WhatsApp, Fecha de Nacimiento y Género) junto con los campos de DNI y Email, y un aviso informativo (`student-create-activation-notice`) sobre la activación de cuenta.
- Se refactorizó `src/utils/registrationValidator.js` extrayendo `validateProfileFields` y `validateEmailField` para compartir reglas de validación entre el auto-registro de clientes (`validateRegistration`) y el alta por administrador (`validateStudentCreate`).
- Se elevó el estado `students` (`MOCK_STUDENTS`) y `studentNotice` a `AdministratorPage` para que el alta en `/administrador/alumnos/nuevo` actualice inmediatamente la tabla en `/administrador/alumnos`.

### Qué se quitó
- Se eliminó el aviso temporal `"Próximamente: pantalla para crear un nuevo alumno."` del botón **Crear alumno** en `StudentsSection`, reemplazándolo por navegación a `/administrador/alumnos/nuevo`.

### Por qué
- Permitir que el administrador dé de alta alumnos con exactamente los mismos datos personales que el registro de clientes sin duplicar formularios ni lógica de validación.
- **Estrategia de activación con Firebase Authentication:** En Firebase Auth cliente estándar, `createUserWithEmailAndPassword` inicia sesión automáticamente con el usuario recién creado y cierra la sesión del administrador. Por ello, al integrar Firebase se utilizará Firebase Admin SDK (vía Cloud Function) o una instancia secundaria de Firebase App + `sendPasswordResetEmail` para que el alumno reciba un correo y cree su propia contraseña. **No se usará el DNI (ni ningún dato personal) como contraseña inicial**; si se requiere crear la cuenta previamente, se asignará una contraseña aleatoria de alta entropía no comunicada al usuario y la activación se realizará únicamente mediante enlace de restablecimiento/activación.

### Pros y Contras
- **Pros:** Reutilización directa de `RegisterProfileFields` y validadores existentes; consistencia total de datos y atributos `data-testid`; estado compartido limpio sin dependencias externas.
- **Contras:** Al recargar el navegador, los alumnos creados en esta etapa mockeada vuelven al estado inicial de `MOCK_STUDENTS` hasta completar la persistencia en Firestore.

---

## ADR-005: Integración con Firebase Admin SDK (Cloud Functions), Eliminación en Cascada y Snackbar Flotante

- **Fecha:** 2026-11-13
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- Se creó el paquete de Cloud Functions (`functions/index.js` y `functions/package.json`) con **Firebase Admin SDK**:
  - `createStudentAccount`: autoriza usando **custom claims** de Firebase Auth (token emitido por backend confiable) para permisos `staff`/`administradora` y no confía en `usuarios/{uid}.rol` para control de acceso; crea el usuario en Firebase Auth sin cerrar la sesión de la administradora, guarda su perfil en `usuarios/{uid}` con `rol: 'customer'` (con rollback automático en Auth si falla Firestore) y genera enlace de activación/restablecimiento de contraseña.
  - `deleteStudentAccount`: autoriza usando **custom claims** (`staff`/`administradora`), valida que el objetivo a eliminar pertenezca a un perfil `customer` antes de borrar, elimina en cascada los documentos relacionados (`reservas`, `membresias_usuario`, `pagos` y `usuarios/{uid}`) y luego borra la cuenta de Firebase Auth.
- Se reforzó el modelo de autorización: en `firestore.rules` los propietarios de `usuarios/{uid}` no pueden escalar privilegios modificando `rol` (ni crear/actualizar campos de rol administrativos por cuenta propia).
- Se restringió el alcance de `databaseId` para impedir decisiones de autorización cruzadas entre entornos (`emuna-testing` / `emuna-prod`) basadas en parámetros controlados por cliente.
- Se agregó `functions` en `src/config/firebase.js` y se creó `src/services/studentService.js` + el hook reutilizable `src/hooks/useStudentsManager.js`.
- Al crear un alumno desde `createStudentViaAdmin`, se dispara `sendPasswordResetEmail` desde el cliente para enviar el email oficial de activación de contraseña sin afectar la sesión actual.
- Se creó la molécula reutilizable `Snackbar` (`src/components/molecules/Snackbar.jsx`) con animación flotante abajo a la derecha (`SnackbarFloating` en `src/index.css`) y variantes `success` / `error`.
- Se actualizó `StudentDeleteDialog` para advertir explícitamente que toda la información relacionada al usuario será eliminada sin posibilidad de deshacer la acción.

### Qué se quitó
- Se eliminó el estado local mockeado directo de alumnos en `AdministratorPage`, centralizándolo en `useStudentsManager`.

### Por qué
- El SDK cliente de Firebase no permite crear usuarios sin cambiar la sesión activa ni eliminar cuentas de otros usuarios en Firebase Auth; Firebase Admin SDK en Cloud Functions resuelve ambas operaciones de forma segura y atómica.
- Un Snackbar flotante desacoplado permite comunicar resultados asíncronos (éxito o error) sin recargar ni alterar el flujo de la tabla o formulario.

### Pros y Contras
- **Pros:** Seguridad real validada en backend; consistencia entre Firebase Auth y Firestore (`emuna-testing` / `emuna-prod`); feedback visual inmediato de éxito y error.
- **Contras:** El despliegue de Cloud Functions en Firebase requiere tener el proyecto en el plan Blaze y ejecutar `firebase deploy --only functions`.

---

## ADR-006: Páginas de Detalle y Edición de Alumno (`/administrador/alumnos/detail` y `/edit`), Reutilización de `StudentFormFields` y Avatar por Género

- **Fecha:** 2026-11-13
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- Se amplió `resolveAdminRoute` en `src/pages/AdministratorPage.jsx` para soportar las acciones `detail` y `edit` bajo `/administrador/alumnos/:action` leyendo `studentId` desde `useSearchParams()`.
- Se creó la molécula reutilizable `StudentFormFields` (`src/components/molecules/StudentFormFields.jsx`) compartida entre `StudentCreateSection` y `StudentEditSection`, evitando duplicar la composición de `RegisterProfileFields` + DNI + Email.
- Se creó `StudentDetailSection` (`src/components/organisms/StudentDetailSection.jsx`) reutilizando el átomo `Avatar` (ampliado con `size="xl"` y `fallbackIcon` para mostrar `woman`, `man` o `person` según el género del alumno cuando no posee `photoURL`).
- Se creó `StudentEditSection` (`src/components/organisms/StudentEditSection.jsx`), `updateStudentProfile` en `src/services/studentService.js` y `updateStudent` en `src/hooks/useStudentsManager.js` con feedback por `Snackbar`.

### Qué se quitó
- Se eliminaron los avisos temporales `"Próximamente: detalle..."` y `"Próximamente: editar..."` en `StudentsSection`.

### Por qué (Path Params vs. Query Params)
- Se adoptaron rutas `/administrador/alumnos/detail?studentId=...` y `/administrador/alumnos/edit?studentId=...` para mantener consistencia directa con el patrón existente `/administrador/:section/:action` (`/administrador/alumnos/nuevo`).
- **Pros:** Reutiliza la estructura de rutas `/administrador/:section/:action` sin agregar más niveles de rutas anidadas y permite manejar fácilmente IDs ausentes o inválidos.
- **Contras:** En REST/SPA convencionales, los path params (`/alumnos/:studentId` y `/alumnos/:studentId/editar`) suelen ser más semánticos para identificar un recurso específico, reservando los query params para filtros o paginación. Si en el futuro se migra a path params, solo requiere ajustar `App.jsx` y `resolveAdminRoute`.


---

## ADR-007: Sección Usuarios (Staff) Exclusiva para Administradora (`/administrador/usuarios`) e Integración Firebase

- **Fecha:** 2026-11-15
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- **Reglas de Seguridad (`firestore.rules`):** Se agregó el helper `isAdmin()` (`rol == 'administradora'`) y se restringió el alta, edición y eliminación de documentos con `rol == 'staff'` exclusivamente a `isAdmin()`, mientras `isStaff()` continúa limitado a gestionar cuentas `customer`.
- **Cloud Functions (`functions/index.js`):** Se refactorizó la lógica compartida (`hasAdminClaim`, `assertAdminCaller`, `createManagedAccount`, `deleteManagedAccount`) y se exportaron `createStaffAccount` (asigna custom claim `{ rol: 'staff' }`) y `deleteStaffAccount`, restringidas a callers con rol `administradora`.
- **Servicios y Hook:** Se exportó `mapCallableError` en `src/services/studentService.js`, se creó `src/services/staffService.js` (`fetchStaffUsers`, `createStaffViaAdmin`, `deleteStaffViaAdmin`, `updateStaffProfile`, `updateStaffActiveStatus`) y `src/hooks/useStaffManager.js` (con estado inicial `[]` y skeleton activo mientras `isAdmin` carga).
- **UI y Reutilización Atómica:** Se generalizaron `StudentsHeader` y `StudentsTable` (incluyendo skeleton de carga y switch `active`), se extrajo la molécula `DetailField` (compartida entre `StudentDetailSection` y `StaffDetailSection`), y se crearon `StaffSection`, `StaffCreateSection`, `StaffEditSection` y `StaffDetailSection`.
- **Aislamiento de Navegación y Rutas:** Se marcó `usuarios` con `adminOnly: true` en `src/data/adminNavItems.js`, se filtró en `AdminSidebar` según `userRole`, y se protegió `/administrador/usuarios` (+ `nuevo`, `edit`, `detail`) en `resolveAdminRoute` de `AdministratorPage.jsx`.

### Qué se quitó
- Se reemplazó el placeholder `"Próximamente"` de la sección `usuarios` en `AdministratorPage.jsx`.
- Se eliminó la duplicación del bloque de campo de detalle entre `StudentDetailSection` y `StaffDetailSection` mediante `DetailField`.

### Por qué
- El personal con rol `staff` no debe poder visualizar, crear, modificar, activar/desactivar ni eliminar otros usuarios `staff`; esa responsabilidad corresponde únicamente a `administradora` tanto en UI como en backend (`firestore.rules` + Cloud Functions).
- Generalizar `StudentsHeader`, `StudentsTable` y extraer `DetailField` mantiene consistencia visual, reutiliza el skeleton de carga y evita duplicación en `src/`.

### Pros y Contras
- **Pros:** Defensa en profundidad (UI + Firestore Rules + Cloud Functions Admin SDK); alta reutilización de moléculas existentes; sin flash de datos mockeados durante la carga.
- **Contras:** Requiere desplegar las reglas actualizadas de Firestore y las nuevas Cloud Functions (`createStaffAccount`, `deleteStaffAccount`) en Firebase para operar en producción/testing.


---

## ADR-008: Módulo de Cobros con Créditos Provisionales (24h), Parser Híbrido de Comprobantes y Conciliación Manual

- **Fecha:** 2026-11-15 (actualizado 2026-11-26)
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- **Reglas de Seguridad (`firestore.rules`):** Se agregó `match /configuracion/{configId}` (lectura para usuarios activos/staff y escritura exclusiva para `administradora`), se habilitó la creación de avisos de pago en `/pagos` con estado `pendiente_conciliacion` (alumno titular o `staff`/`administradora`) y se habilitó la creación de membresías provisionales en `/membresias_usuario` con validación de campos obligatorios e inmutables, reservando aprobación/rechazo definitivo a `administradora`.
- **Cloud Functions (`functions/index.js`):** Se agregó `expireProvisionalPayments` para vencer avisos provisionales expirados (por defecto tras 24h sin confirmación) y cancelar las reservas asociadas liberando cupos.
- **Parser Híbrido de Comprobantes (`src/utils/receiptParser.js`):** Extracción local de número de operación, monto y fecha desde PDFs/texto/archivos + compresión de imagen en JPEG (`dataUrl`) editable antes de enviar.
- **Servicio y Hook (`src/services/paymentService.js`, `src/hooks/usePaymentsManager.js`):** Gestión de configuración de cuenta destino (**Alias**, **CVU**, **Titular**, **CUIL/CUIT**) y plazo de vencimiento provisorio (24h por defecto), aviso de pago con límite de **1 aviso pendiente simultáneo** por alumno, acreditación provisional inmediata (`provisional: true`) y aprobación/rechazo manual por administradora (con anulación automática de reservas vinculadas si se rechaza o vence).
- **UI Admin/Staff y Alumno (`CobrosSection`, `CobrosConfigCard`, `ReceiptPreviewModal`, `CashNoticeModal`, `ReportPaymentModal`, `CustomerPage`, `AdministratorPage`):** Flujo completo para que el alumno vea los datos de la cuenta destino, reporte transferencias/efectivo y reserve de inmediato, y para que `administradora` (o `staff` en modo lectura + registro de aviso en efectivo) gestione las conciliaciones manuales.
- **Reservas (`src/services/scheduleService.js`):** Se actualizó `findEarliestActiveMembership` para excluir membresías canceladas o provisionales vencidas.

### Qué se quitó
- Se reemplazaron los datos mockeados de cobros pendientes (`INITIAL_PENDING_PAYMENTS`) en `AdministratorPage.jsx` y el placeholder estático de créditos/pagos en `CustomerPage.jsx` por datos en vivo de Firestore.
- Por definición del cliente, se descartó la integración automática con la API de MercadoPago, priorizando la conciliación manual dentro de la ventana de 24 horas.

### Por qué
- Permitir que el alumno reserve clases inmediatamente al avisar un pago sin esperar conciliación manual reduce fricción operativa, mientras el límite de 1 aviso pendiente y la expiración automática a las 24h acotan el riesgo de abuso.
- Mostrar explícitamente Alias, CVU, Titular y CUIL/CUIT configurables evita errores de transferencia del alumno y mantiene el control 100% en manos de la administración.

### Pros y Contras
- **Pros:** Reserva inmediata para el alumno; sin dependencia ni mantenimiento de credenciales/APIs externas de MercadoPago; menor carga manual con reconocimiento híbrido de comprobantes; trazabilidad completa en Firestore.
- **Contras:** Requiere desplegar `firestore.rules` y `functions` (`expireProvisionalPayments`) en Firebase para ejecutar la limpieza automática en la nube.

---

## ADR-009: Sidebar Reutilizable (`DashboardSidebar`) y Enrutamiento del Panel de Alumno (`/customer/:section`)

- **Fecha:** 2026-11-26
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- **Organismo reutilizable (`src/components/organisms/DashboardSidebar.jsx`):** Se extrajo la lógica de navegación responsiva (barra lateral persistente en desktop `>= 1024px` con colapso y drawer deslizable con `popover="manual"`, `IntersectionObserver` y soporte de teclado/swipe en mobile) desde `AdminSidebar.jsx` a `DashboardSidebar.jsx`, manteniendo `AdminSidebar.jsx` como wrapper liviano con filtrado `adminOnly`.
- **Navegación del Alumno (`src/data/customerNavItems.js`):** Se definieron las 4 secciones iniciales del panel de alumno: `Turnos` (`/customer/turnos`), `Pagos` (`/customer/pagos`), `Historial de Clases` (`/customer/historial`) y `Configuración` (`/customer/configuracion`).
- **Enrutamiento (`src/App.jsx`, `src/layouts/DashboardLayout.jsx`, `src/pages/CustomerPage.jsx`):** Se configuró `/customer` con redirección a `/customer/turnos` y `/customer/:section` renderizando `CustomerPage` con `DashboardSidebar` (`sidebarId="customer-drawer"`) y vistas placeholder con el mensaje `"Próximo a implementar"`.
- **Cobertura E2E (`tests/features/customerPanel.feature`, `tests/pages/customer.page.js`, `tests/steps/customerPanel.steps.js`):** Se agregaron los escenarios `@EMUNA-101` y `@EMUNA-102` y el método `loginAsCustomer` en `tests/pages/login.page.js`.

### Qué se quitó
- Se reemplazó el contenido previo de `CustomerPage.jsx` por el esqueleto de secciones con sidebar y placeholders `"Próximo a implementar"`, mientras se implementan iterativamente cada módulo de alumno.

### Por qué
- Evitar duplicar la lógica compleja del drawer/sidebar entre administración y alumno siguiendo Atomic Design y el principio DRY.
- Establecer una estructura de rutas predecible (`/customer/:section`) equivalente a `/administrador/:section` antes de construir las pantallas individuales de Turnos, Pagos, Historial de Clases y Configuración.

### Pros y Contras
- **Pros:** Cero duplicación entre `AdminSidebar` y el sidebar de alumno; navegación directa por URL; base limpia para implementar cada sección por separado.
- **Contras:** Las funcionalidades previas de `CustomerPage` (saldo y reporte de pago) quedan temporalmente reemplazadas por el placeholder de `Pagos` hasta migrarlas a su sección dedicada.

---

## ADR-010: Calendario Semanal de Solo Lectura y Banner de Créditos en la Sección Turnos del Alumno

- **Fecha:** 2026-11-26
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- **Utilidades (`src/utils/scheduleUtils.js`):** Se agregó `STUDENT_BOOK_MIN_MINUTES = 10`, `isTurnBookingOpen` (valida que falten al menos 10 minutos para el inicio del turno) y `buildCustomerWeekTurns` (combina turnos persistidos en `turnos_clase` con turnos virtuales de `horarios_base` para hoy y días futuros sin escribir en Firestore).
- **Hook (`src/hooks/useCustomerCalendar.js`):** Carga en modo solo lectura `horarios_base`, `dias_cerrados`, `turnos_clase` y `membresias_usuario` del alumno autenticado, calculando los créditos vigentes disponibles (`totalCredits`).
- **Componentes reutilizables (`src/components/organisms/WeeklyCalendarGrid.jsx`, `src/components/molecules/CalendarDayColumn.jsx`, `src/components/organisms/CalendarSection.jsx`):** Se extrajo la grilla semanal a `WeeklyCalendarGrid` y se extendió `CalendarDayColumn` con `mode="customer"` para deshabilitar días pasados (ocultando la ocupación histórica), turnos dentro de la ventana de 10 minutos previos al inicio, turnos cancelados y turnos con cupo lleno (`Cupo lleno`).
- **Sección Turnos (`src/components/organisms/CustomerTurnsSection.jsx`, `src/pages/CustomerPage.jsx`):** Muestra el banner **"Mis créditos"** arriba del calendario cuando `totalCredits > 0`, seguido de la grilla semanal de turnos.

### Qué se quitó
- Se reemplazó el placeholder `"Próximo a implementar"` de la sección `/customer/turnos` por `CustomerTurnsSection`.

### Por qué
- Las reglas de Firestore (`firestore.rules`) restringen la escritura en `turnos_clase` a `staff` y la lectura global de `reservas` a `staff`/titular; por ello el calendario del alumno opera en modo solo lectura sobre `turnos_clase` + `horarios_base` + `dias_cerrados` sin intentar materializar documentos ni consultar reservas ajenas.
- Ocultar el indicador de ocupación en días pasados evita exponer si hubo cupo lleno en fechas anteriores, mostrándolos simplemente deshabilitados.

### Pros y Contras
- **Pros:** Cumple estrictamente las reglas de seguridad de Firestore; reutiliza el mismo calendario semanal que administración; respeta la regla de corte de 10 minutos antes del inicio.
- **Contras:** La acción de reserva al hacer clic en un turno disponible se implementará en la siguiente iteración.

---

## ADR-011: Flujo de Reserva de Turnos del Alumno (Con/Sin Créditos) y Sección "Próximos turnos..."

- **Fecha:** 2026-11-26
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- **Reglas de Seguridad (`firestore.rules`):** Se amplió `isValidReservation` con los estados `'esperando_comprobante'` y `'comprobante_rechazado'`, y se habilitó a usuarios activos (`isActiveUser()`) a crear turnos virtuales iniciales o actualizar exclusivamente `cuposOcupados` y `actualizadoEn` en `turnos_clase`.
- **Servicio de Reservas (`src/services/scheduleService.js`):** Se actualizó `bookTurnAsStudent` para validar el corte de 10 minutos (`isTurnBookingOpen`), materializar turnos virtuales si no existen en `turnos_clase`, descontar 1 crédito (`confirmada`) cuando el alumno posee saldo o registrar la reserva como `esperando_comprobante` cuando no tiene créditos; además se agregó `fetchUserReservations`.
- **Modal de Confirmación (`src/components/molecules/CustomerBookTurnModal.jsx`):** Al seleccionar un turno disponible se muestra el detalle completo del horario y se informa la deducción de 1 crédito + cancelación hasta 4h antes (si tiene saldo), o los datos bancarios (`cobrosConfig`) + importe de clase individual + aviso de aprobación pendiente (si tiene 0 créditos).
- **Próximos Turnos y Snackbar (`src/components/molecules/CustomerUpcomingTurns.jsx`, `src/components/molecules/Snackbar.jsx`, `src/pages/CustomerPage.jsx`):** Se agregó la lista `"Próximos turnos..."` debajo del calendario con los estados `"Esperando comprobante"`, `"Turno confirmado"`, `"Comprobante rechazado"` y `"Turno cancelado"`, botón `"Informar pago"` para turnos en espera de comprobante, botón de acciones a la derecha de cada fila y `Snackbar` en posición `bottom-left`.

### Por qué
- Permitir que tanto alumnas con paquete activo como alumnas sin créditos puedan reservar un lugar en la cama reformer sin fricción, manteniendo trazabilidad del estado de pago y cupos en tiempo real.

### Pros y Contras
- **Pros:** Flujo completo con y sin créditos; reutilización de `ReportPaymentModal` y `cobrosConfig`; feedback inmediato en esquina inferior izquierda.
- **Contras:** El menú de acciones a la derecha de cada fila en `"Próximos turnos..."` queda como disparador visual hasta implementar la cancelación/reprogramación del alumno.

---

## ADR-012: Secciones "Paquetes" y "Pagos" del Panel de Alumna, Bloqueo por Pagos Pendientes y Limpieza de Rechazados

- **Fecha:** 2026-11-28
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- **Navegación del Alumno (`src/data/customerNavItems.js`, `src/pages/CustomerPage.jsx`):** Se incorporó la opción **"Paquetes"** (`/customer/paquetes`) en el sidebar de alumna y se reemplazó el placeholder de **"Pagos"** (`/customer/pagos`) por su sección funcional.
- **Catálogo y Reserva de Paquetes (`src/components/organisms/CustomerPackagesSection.jsx`, `src/components/molecules/PackageCard.jsx`, `src/components/molecules/ReportPaymentModal.jsx`):** Se muestran todos los paquetes activos desde `paquetes_catalogo` (incluida la clase individual), reutilizando `PackageCard` y `ReportPaymentModal` con preselección del paquete elegido. Al confirmar un paquete, se registra el aviso de pago provisorio y se redirige automáticamente a `/customer/pagos`.
- **Bloqueo por Pagos o Avisos Pendientes (`src/hooks/useCustomerPayments.js`, `src/services/paymentService.js`):** Se bloquea la reserva de cualquier paquete (tanto en UI con banner explicativo y botones deshabilitados como en `reportPaymentNotice`) cuando existe un pago en estado `pendiente_conciliacion` o una reserva en estado `esperando_comprobante` / `pendiente_confirmacion`.
- **Historial de Pagos y Limpieza de Rechazados (`src/components/organisms/CustomerPaymentsSection.jsx`, `src/services/paymentService.js`, `firestore.rules`):** Se implementó la tabla responsive de pagos (columnas `Fecha`, `Paquete / Ítem`, `Importe` y `Estado`) unificando pagos de paquetes, clases individuales y cobros en efectivo registrados por administración. Se agregó `hideRejectedPaymentsForStudent` (`ocultoParaAlumno: true`) y la regla en `firestore.rules` para que la alumna pueda ocultar sus pagos rechazados sin eliminar el registro de auditoría en administración. Se centralizó `formatPaymentDateTime` y `PAYMENT_STATUS_META` para reutilizarlos también en `CobrosTable`.

### Qué se quitó
- Se eliminó el placeholder `"Próximo a implementar"` de `/customer/pagos` y la duplicación de formato de fecha/estados en `CobrosTable`.

### Por qué
- Permitir a la alumna adquirir paquetes de créditos de forma autónoma sin duplicar deuda pendiente mientras tenga pagos o comprobantes sin resolver, y mantener un historial de pagos limpio conservando la trazabilidad contable del estudio.

### Pros y Contras
- **Pros:** Reutilización de `PackageCard`, `ReportPaymentModal` y helpers de `paymentService`; consistencia entre reglas de negocio en UI, servicio y `firestore.rules`; historial unificado.
- **Contras:** El ocultamiento lógico (`ocultoParaAlumno`) requiere que futuras consultas de historial en cliente filtren ese campo.

---

## ADR-013: Sincronización en Tiempo Real con Firestore `onSnapshot` para Cobros, Pagos, Créditos, Reservas y Cupos

- **Fecha:** 2026-11-28
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- **Servicios (`src/services/paymentService.js`, `src/services/scheduleService.js`):** Se agregaron listeners en tiempo real mediante `onSnapshot`: `subscribeAllPayments`, `subscribeUserPayments`, `subscribeUserMemberships`, `subscribeWeekTurns` y `subscribeUserReservations`.
- **Hooks (`src/hooks/usePaymentsManager.js`, `src/hooks/useCustomerPayments.js`, `src/hooks/useCustomerCalendar.js`):** Se reemplazaron las cargas iniciales puntuales (`getDocs`) de cobros, pagos de alumna, membresías/créditos, reservas y turnos semanales por suscripciones `onSnapshot` con limpieza (`unsubscribe`) al desmontar o cambiar de usuario/semana.

### Qué se quitó
- La dependencia exclusiva de recarga manual o `getDocs` puntual para reflejar cambios entre la sesión de alumna y la sesión de administración.

### Por qué
- Permitir que cualquier aviso de pago, reserva de paquete, acreditación, rechazo o cambio de cupo se refleje de forma inmediata en todas las sesiones abiertas sin necesidad de refrescar la página.

### Pros y Contras
- **Pros:** Actualización instantánea entre ventana de alumna y administradora; cero polling; reutiliza las mismas `firestore.rules`.
- **Contras:** Mantiene listeners activos mientras las vistas están montadas, requiriendo limpieza estricta en `useEffect`.

---

## ADR-014: Sección "Mi perfil" de Alumna, Vinculación Google, Cambio de Email por Código OTP y Modal de Contraseña

- **Fecha:** 2026-11-28
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- **Navegación y Ruta (`src/data/customerNavItems.js`, `src/pages/CustomerPage.jsx`):** Se renombró la sección `Configuración` a **"Mi perfil"** (`/customer/perfil`), manteniendo redirección automática desde `/customer/configuracion` por compatibilidad.
- **Datos Personales, Google y Contraseña (`src/components/organisms/CustomerProfileSection.jsx`, `src/context/AuthContext.jsx`, `src/components/molecules/ChangePasswordModal.jsx`):**
  - Se reutilizaron `RegisterProfileFields`, `PasswordRequirementsChecklist`, `validateProfileFields`, `validateDniField` y `formatDniInput` para editar los datos personales del registro (`nombre`, `apellido`, `telefono`, `fechaNacimiento`, `genero`, `dni`).
  - Se agregaron `linkGoogleAccount` (`linkWithPopup`) y `unlinkGoogleAccount` (`unlink`, exigiendo proveedor `password` activo para evitar bloqueo de acceso).
  - Se implementó `ChangePasswordModal` con `<dialog>` nativo (`showModal()`), reautenticación con contraseña actual (`reauthenticateWithCredential` + `updatePassword`) o creación de contraseña para cuentas Google-only (`linkWithCredential`).
- **Cambio/Alta de Correo con Código de 6 Dígitos (`functions/index.js`, `functions/services/emailService.js`, `src/components/molecules/EmailChangeModal.jsx`):**
  - Se agregaron las Cloud Functions `requestEmailChangeCode` y `confirmEmailChangeCode` junto con `sendEmailChangeVerificationCodeEmail` (SMTP Brevo vía `nodemailer`), almacenando el hash SHA-256 del código de 6 dígitos con TTL de 10 minutos y límite de 5 intentos en `email_verification_codes` antes de actualizar Firebase Auth (`emailVerified: true`) y `usuarios/{uid}`.

### Qué se quitó
- El placeholder `"Próximo a implementar"` de la antigua sección de configuración del alumno.

### Por qué
- Permitir que cada alumna administre sus datos personales, agregue un correo real si se registró solo con DNI, vincule/desvincule Google y cambie su contraseña de forma segura sin salir de la aplicación.

### Pros y Contras
- **Pros:** Verificación de correo con código de 6 dígitos dentro de la app compatible con cuentas DNI; reutilización de moléculas y validadores de registro; protección contra bloqueo al desvincular Google.
- **Contras:** Requiere desplegar Cloud Functions (`requestEmailChangeCode` y `confirmEmailChangeCode`) y contar con variables SMTP en `functions/.env`.

---

## ADR-015: Code Splitting por Rutas con `React.lazy`, `Suspense` y `PageLoader`

- **Fecha:** 2026-11-28
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- **Molécula `PageLoader` (`src/components/molecules/PageLoader.jsx`):** Se extrajo el indicador de carga a pantalla completa con identidad de Emuná (`data-testid="page-loader"`) desde `ProtectedRoute.jsx` para reutilizarlo como fallback de navegación y de verificación de sesión.
- **Enrutamiento en `src/App.jsx`:** Se reemplazaron los imports estáticos de todas las páginas (`LandingPage`, `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ForcePasswordChangePage`, `AuthActionPage`, `CustomerPage`, `AdministratorPage`) por `React.lazy(() => import(...))` envueltos en `<Suspense fallback={<PageLoader />}>`.

### Qué se quitó
- Los imports estáticos de las páginas en el bundle inicial (`src/App.jsx`) y el markup duplicado de carga en `ProtectedRoute.jsx`.

### Por qué
- El chunk principal (`dist/assets/index-*.js`) superaba los 500 kB (`516.52 kB`), disparando la advertencia de Vite/Rollup en `npm run build` y obligando a descargar tanto el portal de alumna como el panel de administración y `libphonenumber-js` al entrar a rutas públicas.

### Pros y Contras
- **Pros:** Elimina el warning de chunks > 500 kB; reduce el bundle inicial `index-*.js` de `516.52 kB` a `20.10 kB` (gzip `7.06 kB`); carga bajo demanda cada página y dependencias pesadas.
- **Contras:** Introduce una breve transición con `PageLoader` la primera vez que el usuario navega a una ruta aún no cacheada.
