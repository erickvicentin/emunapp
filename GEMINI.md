# Reglas del Proyecto — Emuná Pilates

Estas reglas aplican de forma obligatoria a cualquier cambio o funcionalidad desarrollada en este repositorio.

## 1. Testability (`data-testid`)
- Agregar siempre atributos `data-testid` descriptivos y consistentes a todos los nuevos elementos interactivos, secciones, tablas, formularios, modales y componentes para facilitar la automatización de pruebas E2E.

## 2. Versionado de la App Web
- Cuando los cambios realizados lo ameriten (nuevas funcionalidades, cambios relevantes de UI/arquitectura o releases), incrementar la versión de la aplicación web en `package.json` siguiendo Semantic Versioning (`major.minor.patch`) según el impacto de los cambios.

## 3. Registro de Decisiones de Arquitectura (ADR)
- Documentar las decisiones de arquitectura relevantes en `docs/ADR.md`.
- Cada entrada debe registrar: qué se cambió, por qué, qué se agregó, qué se quitó, y los pros y contras de la decisión tomada.

## 4. Calidad de Código, Lint y React Doctor
- Después de agregar o modificar código en `src/`, ejecutar siempre el linter (`npm run lint`) y React Doctor (`node scripts/check-doctor-score.mjs` / `npx -y react-doctor@latest . -y`).
- **Condición obligatoria:** El puntaje de React Doctor nunca debe bajar del **95%** de salud. Resolver la causa raíz de cualquier advertencia o error que reduzca el puntaje (sin suprimir ni silenciar reglas).

## 5. Cobertura de Pruebas Automatizadas
- Al implementar nuevas funcionalidades o pantallas, agregar sus correspondientes casos de prueba automatizados E2E en `tests/` para mantener la cobertura de testing al día.

## 6. Estándares de Código y SonarQube
- Evitar complejidad ciclomática/cognitiva innecesaria, código duplicado, code smells, bugs potenciales y vulnerabilidades que afecten negativamente la puntuación en SonarQube.
- Mantener funciones pequeñas, legibles, con responsabilidades claras y retornos tempranos.

## 7. Reutilización y Diseño Atómico
- Priorizar siempre la reutilización de código siguiendo la estructura Atomic Design del proyecto (`atoms`, `molecules`, `organisms`, `layouts`, `utils`, `hooks`).
- Antes de crear un componente nuevo, verificar si puede reutilizarse o componerse con átomos y moléculas existentes.

## 8. Modularidad en Testing Automatizado (WebdriverIO + Cucumber)
- Mantener la separación estricta:
  - Todos los `expect` / assertions van **únicamente** en `tests/steps/*.steps.js`.
  - Toda interacción con elementos web va **únicamente** en los Page Object Models (`tests/pages/*.page.js`).
  - Declarar los selectores/locators como constantes `const` en los Page Objects.
  - Escribir los escenarios Gherkin en inglés siguiendo la estructura `Feature` → `Background` (si aplica) → `@EMUNA-XXX` → `Scenario` / `Scenario Outline`.
- Modularizar y generalizar métodos comunes reutilizables (por ejemplo mediante un `base.page.js` o utilidades compartidas en `tests/`) para evitar duplicación entre pruebas.
