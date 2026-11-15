import { useCallback, useEffect, useState } from 'react';
import {
  createStaffViaAdmin,
  deleteStaffViaAdmin,
  fetchStaffUsers,
  formatDni,
  mapStudentProfileToRow,
  updateStaffActiveStatus,
  updateStaffProfile,
} from '../services/staffService';

/**
 * Manages staff users for administradora accounts, integrating directly with
 * Firestore and Admin SDK Cloud Functions.
 */
export function useStaffManager({ isAdmin = false, showSnackbar } = {}) {
  const [staffUsers, setStaffUsers] = useState([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(Boolean(isAdmin));
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);
  const [togglingStaffId, setTogglingStaffId] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      return undefined;
    }

    let isMounted = true;

    async function loadStaff() {
      try {
        const remoteStaff = await fetchStaffUsers();
        if (isMounted) {
          setStaffUsers(remoteStaff);
        }
      } catch (error) {
        console.warn('No se pudieron cargar los usuarios staff desde Firestore:', error.message);
        if (isMounted) {
          setStaffUsers([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingStaff(false);
        }
      }
    }

    loadStaff();
    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const createStaff = useCallback(
    async (formData) => {
      try {
        const { staff, emailSent } = await createStaffViaAdmin(formData);
        setStaffUsers((prev) => [
          staff,
          ...prev.filter((item) => item.id !== staff.id),
        ]);
        const activationNote = emailSent
          ? 'Se envió un email para que active su contraseña.'
          : 'Podrá generar su contraseña desde el enlace de recuperación.';
        showSnackbar?.(
          'success',
          `Usuario staff "${staff.nombreApellido}" registrado correctamente. ${activationNote}`
        );
        return staff;
      } catch (error) {
        showSnackbar?.('error', error.message);
        throw error;
      }
    },
    [showSnackbar]
  );

  const updateStaff = useCallback(
    async (staffMember, formData) => {
      if (!staffMember) return null;
      try {
        await updateStaffProfile(staffMember.id, formData);

        const updatedRow = mapStudentProfileToRow(
          {
            ...staffMember,
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
          staffMember.id
        );

        setStaffUsers((prev) =>
          prev.map((item) => (item.id === staffMember.id ? updatedRow : item))
        );
        showSnackbar?.(
          'success',
          `Datos de "${updatedRow.nombreApellido}" actualizados correctamente.`
        );
        return updatedRow;
      } catch (error) {
        showSnackbar?.('error', error.message);
        throw error;
      }
    },
    [showSnackbar]
  );

  const deleteStaff = useCallback(
    async (staffMember) => {
      if (!staffMember) return false;
      setIsDeletingStaff(true);
      try {
        await deleteStaffViaAdmin(staffMember.id);
        setStaffUsers((prev) => prev.filter((item) => item.id !== staffMember.id));
        showSnackbar?.(
          'success',
          `Usuario staff "${staffMember.nombreApellido}" eliminado correctamente.`
        );
        return true;
      } catch (error) {
        showSnackbar?.('error', error.message);
        return false;
      } finally {
        setIsDeletingStaff(false);
      }
    },
    [showSnackbar]
  );

  const toggleStaffActive = useCallback(
    async (staffMember, nextActive) => {
      if (!staffMember) return false;
      const targetActive =
        typeof nextActive === 'boolean' ? nextActive : !staffMember.active;
      setTogglingStaffId(staffMember.id);
      try {
        await updateStaffActiveStatus(staffMember.id, targetActive);
        setStaffUsers((prev) =>
          prev.map((item) =>
            item.id === staffMember.id ? { ...item, active: targetActive } : item
          )
        );
        showSnackbar?.(
          'success',
          `Usuario staff "${staffMember.nombreApellido}" ${targetActive ? 'activado' : 'desactivado'} correctamente.`
        );
        return true;
      } catch (error) {
        showSnackbar?.('error', error.message);
        return false;
      } finally {
        setTogglingStaffId(null);
      }
    },
    [showSnackbar]
  );

  return {
    staffUsers,
    isLoadingStaff,
    isDeletingStaff,
    togglingStaffId,
    createStaff,
    updateStaff,
    deleteStaff,
    toggleStaffActive,
  };
}
