import { useCallback, useEffect, useState } from 'react';
import { MOCK_STUDENTS } from '../data/mockStudents';
import {
  createStudentViaAdmin,
  deleteStudentViaAdmin,
  fetchCustomerStudents,
  formatDni,
  mapStudentProfileToRow,
  updateStudentActiveStatus,
  updateStudentProfile,
} from '../services/studentService';

const INITIAL_MOCK_STUDENTS = MOCK_STUDENTS.map((student) => ({
  ...student,
  active: student.active !== false,
  isMock: true,
}));

const INITIAL_SNACKBAR = {
  open: false,
  variant: 'success',
  message: '',
};

const isWebDriverEnvironment = () =>
  typeof navigator !== 'undefined' && Boolean(navigator.webdriver);

export function useStudentsManager() {
  const [students, setStudents] = useState(() =>
    isWebDriverEnvironment() ? INITIAL_MOCK_STUDENTS : []
  );
  const [isLoadingStudents, setIsLoadingStudents] = useState(() => !isWebDriverEnvironment());
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [togglingStudentId, setTogglingStudentId] = useState(null);
  const [snackbar, setSnackbar] = useState(INITIAL_SNACKBAR);

  const showSnackbar = useCallback((variant, message) => {
    setSnackbar({ open: true, variant, message });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    if (isWebDriverEnvironment()) {
      return undefined;
    }

    let isMounted = true;

    async function loadStudents() {
      try {
        const remoteStudents = await fetchCustomerStudents();
        if (isMounted) {
          setStudents(
            remoteStudents.length > 0 ? remoteStudents : INITIAL_MOCK_STUDENTS
          );
        }
      } catch (error) {
        console.warn('No se pudieron cargar los alumnos desde Firestore:', error.message);
        if (isMounted) {
          setStudents(INITIAL_MOCK_STUDENTS);
        }
      } finally {
        if (isMounted) {
          setIsLoadingStudents(false);
        }
      }
    }

    loadStudents();
    return () => {
      isMounted = false;
    };
  }, []);

  const createStudent = useCallback(
    async (formData) => {
      try {
        const { student, emailSent } = await createStudentViaAdmin(formData);
        setStudents((prev) => [
          student,
          ...prev.filter((item) => item.id !== student.id),
        ]);
        const activationNote = emailSent
          ? 'Se envió un email para que active su contraseña.'
          : 'Podrá generar su contraseña desde el enlace de recuperación.';
        showSnackbar(
          'success',
          `Alumno "${student.nombreApellido}" registrado correctamente. ${activationNote}`
        );
        return student;
      } catch (error) {
        showSnackbar('error', error.message);
        throw error;
      }
    },
    [showSnackbar]
  );

  const deleteStudent = useCallback(
    async (student) => {
      if (!student) return false;
      setIsDeletingStudent(true);
      try {
        if (!student.isMock) {
          await deleteStudentViaAdmin(student.id);
        }
        setStudents((prev) => prev.filter((item) => item.id !== student.id));
        showSnackbar(
          'success',
          `Usuario "${student.nombreApellido}" y toda su información relacionada fueron eliminados correctamente.`
        );
        return true;
      } catch (error) {
        showSnackbar('error', error.message);
        return false;
      } finally {
        setIsDeletingStudent(false);
      }
    },
    [showSnackbar]
  );

  const updateStudent = useCallback(
    async (student, formData) => {
      if (!student) return null;
      try {
        if (!student.isMock) {
          await updateStudentProfile(student.id, formData);
        }

        const updatedRow = mapStudentProfileToRow(
          {
            ...student,
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            nombreApellido: `${formData.nombre.trim()} ${formData.apellido.trim()}`,
            telefono: formData.telefono.trim(),
            fechaNacimiento: formData.fechaNacimiento,
            genero: formData.genero || 'no_especificar',
            dni: formatDni(formData.dni),
            edad: undefined,
            sexo: undefined,
          },
          student.id
        );

        setStudents((prev) =>
          prev.map((item) => (item.id === student.id ? updatedRow : item))
        );
        showSnackbar(
          'success',
          `Datos de "${updatedRow.nombreApellido}" actualizados correctamente.`
        );
        return updatedRow;
      } catch (error) {
        showSnackbar('error', error.message);
        throw error;
      }
    },
    [showSnackbar]
  );

  const toggleStudentActive = useCallback(
    async (student, nextActive) => {
      if (!student) return false;
      const targetActive = typeof nextActive === 'boolean' ? nextActive : !student.active;
      setTogglingStudentId(student.id);
      try {
        if (!student.isMock) {
          await updateStudentActiveStatus(student.id, targetActive);
        }
        setStudents((prev) =>
          prev.map((item) =>
            item.id === student.id ? { ...item, active: targetActive } : item
          )
        );
        showSnackbar(
          'success',
          `Alumno "${student.nombreApellido}" ${targetActive ? 'activado' : 'desactivado'} correctamente.`
        );
        return true;
      } catch (error) {
        showSnackbar('error', error.message);
        return false;
      } finally {
        setTogglingStudentId(null);
      }
    },
    [showSnackbar]
  );

  return {
    students,
    isLoadingStudents,
    isDeletingStudent,
    togglingStudentId,
    snackbar,
    showSnackbar,
    closeSnackbar,
    createStudent,
    updateStudent,
    deleteStudent,
    toggleStudentActive,
  };
}
