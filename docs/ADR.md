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
- **Estrategia de activación con Firebase Authentication:** En Firebase Auth cliente estándar, `createUserWithEmailAndPassword` inicia sesión automáticamente con el usuario recién creado y cierra la sesión del administrador. Por ello, al integrar Firebase se utilizará Firebase Admin SDK (vía Cloud Function) o una instancia secundaria de Firebase App + `sendPasswordResetEmail` para que el alumno reciba un correo y cree su propia contraseña, manteniendo como alternativa/respaldo la contraseña inicial igual al DNI con cambio obligatorio en el primer ingreso.

### Pros y Contras
- **Pros:** Reutilización directa de `RegisterProfileFields` y validadores existentes; consistencia total de datos y atributos `data-testid`; estado compartido limpio sin dependencias externas.
- **Contras:** Al recargar el navegador, los alumnos creados en esta etapa mockeada vuelven al estado inicial de `MOCK_STUDENTS` hasta completar la persistencia en Firestore.

---

## ADR-005: Integración con Firebase Admin SDK (Cloud Functions), Eliminación en Cascada y Snackbar Flotante

- **Fecha:** 2026-11-13
- **Estado:** Aceptada

### Qué se cambió / Qué se agregó
- Se creó el paquete de Cloud Functions (`functions/index.js` y `functions/package.json`) con **Firebase Admin SDK**:
  - `createStudentAccount`: valida permisos `staff`/`administradora` en el `databaseId` solicitado (`emuna-testing` o `emuna-prod`), crea el usuario en Firebase Auth sin cerrar la sesión de la administradora, guarda su perfil en `usuarios/{uid}` con `rol: 'customer'` (con rollback automático en Auth si falla Firestore) y genera enlace de activación/restablecimiento de contraseña.
  - `deleteStudentAccount`: valida permisos `staff`/`administradora`, elimina en cascada los documentos relacionados (`reservas`, `membresias_usuario`, `pagos` y `usuarios/{uid}`) y borra la cuenta de Firebase Auth.
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
