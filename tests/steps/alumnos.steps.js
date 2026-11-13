import { When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import AlumnosPage from '../pages/alumnos.page.js';

Then(
  'the students section should be visible with title {string}',
  async (expectedTitle) => {
    await AlumnosPage.waitForPageLoad();
    const isDisplayed = await AlumnosPage.isSectionDisplayed();
    const titleText = await AlumnosPage.getTitleText();

    expect(isDisplayed).toBe(true);
    expect(titleText).toBe(expectedTitle);
  }
);

Then(
  'the {string} and {string} buttons should be visible',
  async (_createLabel, _exportLabel) => {
    const createDisplayed = await AlumnosPage.isCreateButtonDisplayed();
    const exportDisplayed = await AlumnosPage.isExportButtonDisplayed();

    expect(createDisplayed).toBe(true);
    expect(exportDisplayed).toBe(true);
  }
);

Then(
  'the students table should be visible with all required columns',
  async () => {
    const tableDisplayed = await AlumnosPage.isTableDisplayed();
    const headers = await AlumnosPage.getHeaderTexts();
    const normalizedHeaders = headers.map((h) => h.toUpperCase());

    expect(tableDisplayed).toBe(true);
    expect(normalizedHeaders).toContain('NOMBRE Y APELLIDO');
    expect(normalizedHeaders).toContain('DNI');
    expect(normalizedHeaders).toContain('EDAD');
    expect(normalizedHeaders).toContain('SEXO');
    expect(normalizedHeaders).toContain('% DE ASISTENCIA');
    expect(normalizedHeaders).toContain('ACCIONES');
  }
);

Then(
  'the students table should display {string} registered students',
  async (expectedCount) => {
    const rowsCount = await AlumnosPage.getRowsCount();
    const badgeText = await AlumnosPage.getCountBadgeText();

    expect(rowsCount).toBe(Number(expectedCount));
    expect(badgeText).toContain(`${expectedCount} registrados`);
  }
);

Then(
  'the row for student {string} should display complete student details',
  async (studentId) => {
    const data = await AlumnosPage.getStudentRowData(studentId);

    expect(data.name.length).toBeGreaterThan(0);
    expect(data.dni.length).toBeGreaterThan(0);
    expect(data.age).toContain('años');
    expect(data.gender.length).toBeGreaterThan(0);
    expect(data.attendance).toContain('%');
  }
);

Then(
  'the row for student {string} should display the view, edit, and delete action icons',
  async (studentId) => {
    const allButtonsVisible =
      await AlumnosPage.areRowActionButtonsDisplayed(studentId);
    expect(allButtonsVisible).toBe(true);
  }
);

When('the administrator clicks the {string} button', async (buttonName) => {
  if (buttonName === 'Crear alumno') {
    await AlumnosPage.clickCreateStudent();
  } else if (buttonName === 'Exportar plantilla como Excel') {
    await AlumnosPage.clickExportExcel();
  } else {
    throw new Error(`Unknown button: ${buttonName}`);
  }
});

When(
  'the administrator clicks the view icon for student {string}',
  async (studentId) => {
    await AlumnosPage.clickViewStudent(studentId);
  }
);

When(
  'the administrator clicks the edit icon for student {string}',
  async (studentId) => {
    await AlumnosPage.clickEditStudent(studentId);
  }
);

When(
  'the administrator clicks the delete icon for student {string}',
  async (studentId) => {
    await AlumnosPage.clickDeleteStudent(studentId);
  }
);

Then('an inline notice should display {string}', async (expectedText) => {
  const noticeVisible = await AlumnosPage.isNoticeDisplayed();
  const noticeText = await AlumnosPage.getNoticeText();

  expect(noticeVisible).toBe(true);
  expect(noticeText).toContain(expectedText);
});

Then('the delete confirmation dialog should be open', async () => {
  const isOpen = await AlumnosPage.isDeleteDialogOpen();
  expect(isOpen).toBe(true);
});

When('the administrator confirms the student deletion', async () => {
  await AlumnosPage.confirmDeleteStudent();
});

Then(
  'the row for student {string} should no longer exist in the table',
  async (studentId) => {
    const exists = await AlumnosPage.isStudentRowDisplayed(studentId);
    expect(exists).toBe(false);
  }
);
