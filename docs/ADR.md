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
