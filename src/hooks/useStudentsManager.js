import { useCallback, useEffect, useState } from 'react';
import { MOCK_STUDENTS } from '../data/mockStudents';
import {
  createStudentViaAdmin,
  deleteStudentViaAdmin,
  fetchCustomerStudents,
  formatDni,
  mapStudentProfileToRow,
  updateStudentProfile,
} from '../services/studentService';

const INITIAL_MOCK_STUDENTS = MOCK_STUDENTS.map((student) => ({
  ...student,
  isMock: true,
}));

const INITIAL_SNACKBAR = {
  open: false,
  variant: 'success',
  message: '',
};

export function useStudentsManager() {
  const [students, setStudents] = useState(INITIAL_MOCK_STUDENTS);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [snackbar, setSnackbar] = useState(INITIAL_SNACKBAR);

  const showSnackbar = useCallback((variant, message) => {
    setSnackbar({ open: true, variant, message });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadStudents() {
      try {
        const remoteStudents = await fetchCustomerStudents();
        if (isMounted && remoteStudents.length > 0) {
          setStudents(remoteStudents);
        }
      } catch (error) {
        console.warn('No se pudieron cargar los alumnos desde Firestore:', error.message);
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

  return {
    students,
    isLoadingStudents,
    isDeletingStudent,
    snackbar,
    closeSnackbar,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}
