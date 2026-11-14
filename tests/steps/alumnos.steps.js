import { When, Then } from "@wdio/cucumber-framework";
import { expect } from "@wdio/globals";
import AlumnosPage from "../pages/alumnos.page.js";
import StudentCreatePage from "../pages/studentCreate.page.js";

Then(
  "the students section should be visible with title {string}",
  async (expectedTitle) => {
    await AlumnosPage.waitForPageLoad();
    const isDisplayed = await AlumnosPage.isSectionDisplayed();
    const titleText = await AlumnosPage.getTitleText();

    expect(isDisplayed).toBe(true);
    expect(titleText).toBe(expectedTitle);
  },
);

Then(
  "the {string} and {string} buttons should be visible",
  async (_createLabel, _exportLabel) => {
    const createDisplayed = await AlumnosPage.isCreateButtonDisplayed();
    const exportDisplayed = await AlumnosPage.isExportButtonDisplayed();

    expect(createDisplayed).toBe(true);
    expect(exportDisplayed).toBe(true);
  },
);

Then(
  "the students table should be visible with all required columns",
  async () => {
    const tableDisplayed = await AlumnosPage.isTableDisplayed();
    const headers = await AlumnosPage.getHeaderTexts();
    const normalizedHeaders = headers.map((h) => h.toUpperCase());

    expect(tableDisplayed).toBe(true);
    expect(normalizedHeaders).toContain("NOMBRE Y APELLIDO");
    expect(normalizedHeaders).toContain("DNI");
    expect(normalizedHeaders).toContain("EDAD");
    expect(normalizedHeaders).toContain("SEXO");
    expect(normalizedHeaders).toContain("% DE ASISTENCIA");
    expect(normalizedHeaders).toContain("ACCIONES");
  },
);

Then(
  "the students table should display {string} registered students",
  async (expectedCount) => {
    const expected = Number(expectedCount);
    await AlumnosPage.waitForStudentsCount(expected);
    const rowsCount = await AlumnosPage.getRowsCount();
    const badgeText = await AlumnosPage.getCountBadgeText();

    expect(rowsCount).toBe(expected);
    expect(badgeText).toContain(`${expectedCount} registrados`);
  },
);

Then(
  "the students table should display same registered students that StudentCount",
  async () => {
    const rowsCount = await AlumnosPage.getRowsCount();
    const badgeText = await AlumnosPage.getCountBadgeText();

    expect(badgeText).toContain(`${rowsCount} registrados`);
  },
);

Then(
  "the row for student {string} should display complete student details",
  async (studentId) => {
    const data = await AlumnosPage.getStudentRowData(studentId);

    expect(data.name.length).toBeGreaterThan(0);
    expect(data.dni.length).toBeGreaterThan(0);
    expect(data.age).toContain("años");
    expect(data.gender.length).toBeGreaterThan(0);
    expect(data.attendance).toContain("%");
  },
);

Then(
  "the row for student {string} should display the view, edit, and delete action icons",
  async (studentId) => {
    const allButtonsVisible =
      await AlumnosPage.areRowActionButtonsDisplayed(studentId);
    expect(allButtonsVisible).toBe(true);
  },
);

When("the administrator clicks the {string} button", async (buttonName) => {
  if (buttonName === "Crear alumno") {
    await AlumnosPage.clickCreateStudent();
  } else if (buttonName === "Exportar plantilla como Excel") {
    await AlumnosPage.clickExportExcel();
  } else {
    throw new Error(`Unknown button: ${buttonName}`);
  }
});

When(
  "the administrator clicks the view icon for student {string}",
  async (studentId) => {
    await AlumnosPage.clickViewStudent(studentId);
  },
);

When(
  "the administrator clicks the edit icon for student {string}",
  async (studentId) => {
    await AlumnosPage.clickEditStudent(studentId);
  },
);

When(
  "the administrator clicks the delete icon for student {string}",
  async (studentId) => {
    await AlumnosPage.clickDeleteStudent(studentId);
  },
);

Then("an inline notice should display {string}", async (expectedText) => {
  const noticeVisible = await AlumnosPage.isNoticeDisplayed();
  const noticeText = await AlumnosPage.getNoticeText();

  expect(noticeVisible).toBe(true);
  expect(noticeText).toContain(expectedText);
});

Then(
  "the delete confirmation dialog should be open with irreversible warning",
  async () => {
    const isOpen = await AlumnosPage.isDeleteDialogOpen();
    const warningText = await AlumnosPage.getDeleteWarningText();

    expect(isOpen).toBe(true);
    expect(warningText).toContain("Todo lo relacionado al mismo");
    expect(warningText).toContain("sin posibilidad de deshacer la acción");
  },
);

Then(
  "a {string} snackbar should appear indicating deletion succeeded",
  async (expectedVariant) => {
    const snackbar = await AlumnosPage.getSnackbarState();
    expect(snackbar.displayed).toBe(true);
    expect(snackbar.variant).toBe(expectedVariant);
    expect(snackbar.message).toContain("eliminados correctamente");
  },
);

Then(
  "an {string} snackbar should appear with the error message",
  async (expectedVariant) => {
    const snackbar = await StudentCreatePage.getSnackbarState();
    expect(snackbar.displayed).toBe(true);
    expect(snackbar.variant).toBe(expectedVariant);
    expect(snackbar.message.length).toBeGreaterThan(0);
  },
);

When("the administrator confirms the student deletion", async () => {
  await AlumnosPage.confirmDeleteStudent();
});

Then(
  "the row for student {string} should no longer exist in the table",
  async (studentId) => {
    const exists = await AlumnosPage.isStudentRowDisplayed(studentId);
    expect(exists).toBe(false);
  },
);

Then("the students search bar should be visible", async () => {
  const isDisplayed = await AlumnosPage.isSearchBarDisplayed();
  expect(isDisplayed).toBe(true);
});

When(
  "the administrator searches for {string} in the students search bar",
  async (query) => {
    await AlumnosPage.searchStudents(query);
  },
);

Then(
  "the students table should display {string} matching rows",
  async (expectedCount) => {
    const expected = Number(expectedCount);
    await AlumnosPage.waitForRowsCount(expected);
    const rowsCount = await AlumnosPage.getRowsCount();
    expect(rowsCount).toBe(expected);
  },
);

Then(
  "the row for student {string} should be visible in the table",
  async (studentId) => {
    const isVisible = await AlumnosPage.isStudentRowDisplayed(studentId);
    expect(isVisible).toBe(true);
  },
);

Then("the empty search results state should be visible", async () => {
  const isDisplayed = await AlumnosPage.isEmptySearchStateDisplayed();
  expect(isDisplayed).toBe(true);
});

When('the administrator clicks the "Limpiar" search button', async () => {
  await AlumnosPage.clickClearSearch();
});

Then("the students search input should be empty", async () => {
  const value = await AlumnosPage.getSearchInputValue();
  expect(value).toBe("");
});

Then(
  "the student creation page should be visible with title {string}",
  async (expectedTitle) => {
    await StudentCreatePage.waitForPageLoad();
    const isDisplayed = await StudentCreatePage.isSectionDisplayed();
    const title = await StudentCreatePage.getTitleText();
    const url = await StudentCreatePage.getCurrentUrl();

    expect(isDisplayed).toBe(true);
    expect(title).toBe(expectedTitle);
    expect(url).toContain("/administrador/alumnos/nuevo");
  },
);

Then("the student activation notice should be visible", async () => {
  const isDisplayed = await StudentCreatePage.isActivationNoticeDisplayed();
  const noticeText = await StudentCreatePage.getActivationNoticeText();

  expect(isDisplayed).toBe(true);
  expect(noticeText).toContain("DNI");
});

When(
  "the administrator completes the new student form with valid data",
  async () => {
    await StudentCreatePage.fillStudentForm({
      nombre: "Camila",
      apellido: "Navarro",
      telefono: "+54 9 11 5555-9988",
      fechaNacimiento: "1997-08-20",
      genero: "mujer",
      dni: "40123456",
      email: "camila.navarro@emuna.com",
    });
  },
);

When("the administrator submits the new student form", async () => {
  await StudentCreatePage.clickSubmit();
});

Then(
  "the student creation form should show validation error {string}",
  async (expectedError) => {
    const hasError =
      await StudentCreatePage.isSectionTextVisible(expectedError);
    expect(hasError).toBe(true);
  },
);
