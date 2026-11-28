import React, { useRef, useState } from 'react';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import StudentsHeader from '../molecules/StudentsHeader';
import PackageFormModal from '../molecules/PackageFormModal';

const SKELETON_CARD_IDS = ['pkg-sk-1', 'pkg-sk-2', 'pkg-sk-3', 'pkg-sk-4'];

/**
 * PackagesSection Organism
 * Admin panel view for managing membership packages & prices reflected on the landing page.
 */
export default function PackagesSection({
  packages = [],
  isLoading = false,
  isSaving = false,
  isDeleting = false,
  togglingPackageId = null,
  onCreatePackage,
  onUpdatePackage,
  onToggleActive,
  onDeletePackage,
}) {
  const formDialogRef = useRef(null);
  const deleteDialogRef = useRef(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageToDelete, setPackageToDelete] = useState(null);

  const openCreateModal = () => {
    setEditingPackage(null);
    formDialogRef.current?.showModal();
  };

  const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    formDialogRef.current?.showModal();
  };

  const closeFormModal = () => {
    formDialogRef.current?.close();
    setEditingPackage(null);
  };

  const handleFormSubmit = async (formData) => {
    if (editingPackage) {
      await onUpdatePackage(editingPackage, formData);
    } else {
      await onCreatePackage(formData);
    }
    closeFormModal();
  };

  const openDeleteDialog = (pkg) => {
    setPackageToDelete(pkg);
    deleteDialogRef.current?.showModal();
  };

  const closeDeleteDialog = () => {
    deleteDialogRef.current?.close();
    setPackageToDelete(null);
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (!packageToDelete) return;
    const deleted = await onDeletePackage(packageToDelete);
    if (deleted) {
      closeDeleteDialog();
    }
  };

  return (
    <div data-testid="packages-section" className="space-y-5">
      <StudentsHeader
        title="Precios y Paquetes"
        subtitle="Configurá los paquetes de cupos y precios. Los paquetes activos se reflejan automáticamente en la landing page."
        createLabel="Crear paquete"
        studentsCount={packages.length}
        showExport={false}
        testIdPrefix="packages"
        onCreateStudent={openCreateModal}
      />

      {isLoading ? (
        <div
          data-testid="packages-loading-skeleton"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {SKELETON_CARD_IDS.map((id) => (
            <div
              key={id}
              className="h-64 rounded-2xl bg-surface-container-lowest border border-surface-container-high p-5 animate-pulse space-y-3"
            >
              <div className="h-4 w-24 rounded bg-surface-container-high" />
              <div className="h-6 w-36 rounded bg-surface-container-high" />
              <div className="h-8 w-28 rounded bg-surface-container-high mt-3" />
              <div className="h-3 w-full rounded bg-surface-container-high mt-4" />
              <div className="h-3 w-3/4 rounded bg-surface-container-high" />
            </div>
          ))}
        </div>
      ) : (
        <div
          data-testid="packages-grid"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {packages.map((pkg) => {
            const isToggling = togglingPackageId === pkg.id;
            return (
              <article
                key={pkg.id}
                data-testid={`package-card-${pkg.id}`}
                className={`rounded-2xl bg-surface-container-lowest border p-5 flex flex-col justify-between shadow-xs transition-all ${
                  pkg.active
                    ? 'border-surface-container-high'
                    : 'border-outline-variant/50 opacity-75'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.isProtected && (
                        <Badge
                          variant="neutral"
                          data-testid={`package-protected-badge-${pkg.id}`}
                        >
                          Base • Obligatorio
                        </Badge>
                      )}
                      {pkg.isPopular && (
                        <Badge
                          variant="success"
                          data-testid={`package-popular-badge-${pkg.id}`}
                        >
                          Más Elegido
                        </Badge>
                      )}
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={pkg.active}
                      aria-label={`Activar o desactivar ${pkg.name}`}
                      data-testid={`package-active-switch-${pkg.id}`}
                      disabled={isToggling}
                      onClick={() => onToggleActive(pkg)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50 ${
                        pkg.active ? 'bg-emerald-600' : 'bg-outline-variant'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                          pkg.active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                      {pkg.category || 'Paquete'}
                    </p>
                    <h3
                      data-testid={`package-name-${pkg.id}`}
                      className="font-headline-sm text-headline-sm text-primary font-semibold"
                    >
                      {pkg.name}
                    </h3>
                    {pkg.frequency && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {pkg.frequency}
                      </p>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span
                      data-testid={`package-price-${pkg.id}`}
                      className="font-headline-md text-headline-md text-primary font-bold"
                    >
                      {pkg.price}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      • {pkg.classesCount} {pkg.classesCount === 1 ? 'cupo' : 'cupos'} • {pkg.validityDays} días
                    </span>
                  </div>

                  {pkg.features?.length > 0 && (
                    <ul className="space-y-1 pt-2 border-t border-surface-container text-body-sm text-on-surface-variant">
                      {pkg.features.slice(0, 3).map((feat) => (
                        <li key={feat} className="flex items-start gap-1.5">
                          <Icon name="check" className="text-[16px] text-secondary shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-surface-container flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-testid={`package-edit-btn-${pkg.id}`}
                    onClick={() => openEditModal(pkg)}
                    className="gap-1.5"
                  >
                    <Icon name="edit" className="text-[16px]" />
                    <span>Editar</span>
                  </Button>

                  <button
                    type="button"
                    data-testid={`package-delete-btn-${pkg.id}`}
                    disabled={pkg.isProtected}
                    title={
                      pkg.isProtected
                        ? 'La clase individual es obligatoria y no se puede eliminar'
                        : `Eliminar ${pkg.name}`
                    }
                    onClick={() => openDeleteDialog(pkg)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-label-md text-[13px] font-medium text-error hover:bg-error-container/60 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <Icon name="delete" className="text-[16px]" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <PackageFormModal
        key={editingPackage?.id || 'create-package'}
        dialogRef={formDialogRef}
        editingPackage={editingPackage}
        isSaving={isSaving}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
      />

      <dialog
        ref={deleteDialogRef}
        data-testid="package-delete-dialog"
        aria-labelledby="package-delete-title"
        onClose={() => setPackageToDelete(null)}
        className="rounded-2xl bg-surface-container-lowest border border-surface-container-high p-6 shadow-xl max-w-md w-[calc(100%-2rem)] text-on-surface m-auto"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
            <Icon name="delete_forever" className="text-[22px]" />
          </div>
          <div>
            <h2
              id="package-delete-title"
              className="font-headline-sm text-headline-sm text-primary font-semibold"
            >
              ¿Eliminar paquete?
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Estás por eliminar{' '}
              <strong className="text-primary">{packageToDelete?.name}</strong>.
              Dejará de mostrarse en la landing page y para nuevas asignaciones.
            </p>
          </div>
        </div>

        <form
          method="dialog"
          onSubmit={handleConfirmDelete}
          className="mt-6 flex items-center justify-end gap-3"
        >
          <button
            type="button"
            data-testid="package-delete-cancel-btn"
            onClick={closeDeleteDialog}
            disabled={isDeleting}
            className="px-4 py-2 rounded-full border border-outline-variant text-primary font-label-md text-[13px] font-semibold hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            data-testid="package-delete-confirm-btn"
            disabled={isDeleting}
            className="px-4 py-2 rounded-full bg-error text-on-error font-label-md text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </form>
      </dialog>
    </div>
  );
}
