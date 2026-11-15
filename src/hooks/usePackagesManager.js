import { useEffect, useState } from 'react';
import {
  createPackage,
  deletePackage,
  fetchPackages,
  seedDefaultPackages,
  updatePackage,
  updatePackageActiveStatus,
} from '../services/packageService';

/**
 * Custom hook encapsulating Firestore CRUD state for Precios y Paquetes.
 */
export function usePackagesManager({ isEnabled = true, showSnackbar }) {
  const [packages, setPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(Boolean(isEnabled));
  const [isSavingPackage, setIsSavingPackage] = useState(false);
  const [isDeletingPackage, setIsDeletingPackage] = useState(false);
  const [togglingPackageId, setTogglingPackageId] = useState(null);

  useEffect(() => {
    if (!isEnabled) return;

    let active = true;

    async function load() {
      try {
        let list = await fetchPackages();
        if (list.length === 0) {
          list = await seedDefaultPackages();
        }
        if (active) {
          setPackages(list);
        }
      } catch {
        if (active) {
          showSnackbar?.('error', 'No se pudieron cargar los paquetes desde Firestore.');
        }
      } finally {
        if (active) {
          setIsLoadingPackages(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [isEnabled, showSnackbar]);

  const handleCreatePackage = async (formData) => {
    setIsSavingPackage(true);
    try {
      const created = await createPackage(formData);
      setPackages((prev) =>
        [...prev, created].sort((a, b) => a.order - b.order || a.classesCount - b.classesCount)
      );
      showSnackbar?.('success', `Paquete "${created.name}" creado correctamente.`);
      return created;
    } catch {
      showSnackbar?.('error', 'No se pudo crear el paquete.');
      throw new Error('create-package-failed');
    } finally {
      setIsSavingPackage(false);
    }
  };

  const handleUpdatePackage = async (pkg, formData) => {
    setIsSavingPackage(true);
    try {
      const updated = await updatePackage(pkg.id, formData, {
        isProtected: pkg.isProtected,
      });
      setPackages((prev) =>
        prev
          .map((item) => (item.id === pkg.id ? { ...item, ...updated } : item))
          .sort((a, b) => a.order - b.order || a.classesCount - b.classesCount)
      );
      showSnackbar?.('success', `Paquete "${updated.name}" actualizado correctamente.`);
      return updated;
    } catch {
      showSnackbar?.('error', 'No se pudo actualizar el paquete.');
      throw new Error('update-package-failed');
    } finally {
      setIsSavingPackage(false);
    }
  };

  const handleToggleActive = async (pkg) => {
    const nextActive = !pkg.active;
    setTogglingPackageId(pkg.id);
    try {
      await updatePackageActiveStatus(pkg.id, nextActive);
      setPackages((prev) =>
        prev.map((item) =>
          item.id === pkg.id ? { ...item, active: nextActive } : item
        )
      );
      showSnackbar?.(
        'success',
        `Paquete "${pkg.name}" ${nextActive ? 'activado' : 'desactivado'} correctamente.`
      );
    } catch {
      showSnackbar?.('error', 'No se pudo actualizar el estado del paquete.');
    } finally {
      setTogglingPackageId(null);
    }
  };

  const handleDeletePackage = async (pkg) => {
    setIsDeletingPackage(true);
    try {
      await deletePackage(pkg);
      setPackages((prev) => prev.filter((item) => item.id !== pkg.id));
      showSnackbar?.('success', `Paquete "${pkg.name}" eliminado correctamente.`);
      return true;
    } catch (err) {
      showSnackbar?.('error', err?.message || 'No se pudo eliminar el paquete.');
      return false;
    } finally {
      setIsDeletingPackage(false);
    }
  };

  return {
    packages,
    isLoadingPackages,
    isSavingPackage,
    isDeletingPackage,
    togglingPackageId,
    handleCreatePackage,
    handleUpdatePackage,
    handleToggleActive,
    handleDeletePackage,
  };
}
