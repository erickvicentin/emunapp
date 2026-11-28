import React, { useState } from 'react';
import Icon from '../atoms/Icon';
import Input from '../atoms/Input';
import Button from '../atoms/Button';

const INITIAL_FORM = {
  name: '',
  category: '',
  frequency: '',
  classesCount: '4',
  numericPrice: '',
  validityDays: '30',
  featuresText: '',
  isPopular: false,
  active: true,
};

function mapPackageToForm(pkg) {
  if (!pkg) return INITIAL_FORM;
  return {
    name: pkg.name || '',
    category: pkg.category || '',
    frequency: pkg.frequency || '',
    classesCount: String(pkg.classesCount || 1),
    numericPrice: String(pkg.numericPrice ?? ''),
    validityDays: String(pkg.validityDays || 30),
    featuresText: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
    isPopular: Boolean(pkg.isPopular),
    active: pkg.active !== false,
  };
}

/**
 * PackageFormModal Molecule
 * Modal dialog for creating or editing a membership package.
 */
export default function PackageFormModal({
  dialogRef,
  editingPackage,
  isSaving = false,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(() => mapPackageToForm(editingPackage));
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'El nombre del paquete es obligatorio.';
    }
    const classesCount = Number(formData.classesCount);
    if (!Number.isInteger(classesCount) || classesCount < 1 || classesCount > 100) {
      nextErrors.classesCount = 'Ingresá una cantidad válida entre 1 y 100 cupos.';
    }
    const numericPrice = Number(formData.numericPrice);
    if (formData.numericPrice === '' || Number.isNaN(numericPrice) || numericPrice < 0) {
      nextErrors.numericPrice = 'Ingresá un precio válido (mayor o igual a 0).';
    }
    const validityDays = Number(formData.validityDays);
    if (!Number.isInteger(validityDays) || validityDays < 1 || validityDays > 365) {
      nextErrors.validityDays = 'La vigencia debe ser entre 1 y 365 días.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onSubmit(formData);
  };

  return (
    <dialog
      ref={dialogRef}
      data-testid="package-form-dialog"
      aria-labelledby="package-form-title"
      onClose={onClose}
      className="rounded-2xl bg-surface-container-lowest border border-surface-container-high p-6 shadow-xl max-w-xl w-[calc(100%-2rem)] text-on-surface m-auto"
    >
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Precios y Paquetes
          </span>
          <h2
            id="package-form-title"
            data-testid="package-form-title"
            className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5"
          >
            {editingPackage ? `Editar "${editingPackage.name}"` : 'Crear nuevo paquete'}
          </h2>
        </div>
        <button
          type="button"
          data-testid="package-form-close-btn"
          onClick={onClose}
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="package-name-input"
            data-testid="package-name-input"
            name="name"
            label="Nombre del paquete"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: 8 Clases"
            required
            error={errors.name}
          />
          <Input
            id="package-category-input"
            data-testid="package-category-input"
            name="category"
            label="Etiqueta / Categoría"
            value={formData.category}
            onChange={handleChange}
            placeholder="Ej: Recomendado"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            id="package-classes-input"
            data-testid="package-classes-input"
            name="classesCount"
            type="number"
            min="1"
            max="100"
            label="Cupos (clases)"
            value={formData.classesCount}
            onChange={handleChange}
            required
            error={errors.classesCount}
          />
          <Input
            id="package-price-input"
            data-testid="package-price-input"
            name="numericPrice"
            type="number"
            min="0"
            step="100"
            label="Precio (ARS)"
            value={formData.numericPrice}
            onChange={handleChange}
            placeholder="38500"
            required
            error={errors.numericPrice}
          />
          <Input
            id="package-validity-input"
            data-testid="package-validity-input"
            name="validityDays"
            type="number"
            min="1"
            max="365"
            label="Vigencia (días)"
            value={formData.validityDays}
            onChange={handleChange}
            required
            error={errors.validityDays}
          />
        </div>

        <Input
          id="package-frequency-input"
          data-testid="package-frequency-input"
          name="frequency"
          label="Subtítulo / Frecuencia sugerida"
          value={formData.frequency}
          onChange={handleChange}
          placeholder="Ej: 2 veces por semana"
        />

        <div>
          <label
            htmlFor="package-features-input"
            className="block font-label-md text-label-md text-on-surface mb-1.5"
          >
            Beneficios incluidos (uno por línea)
          </label>
          <textarea
            id="package-features-input"
            data-testid="package-features-input"
            name="featuresText"
            rows={3}
            value={formData.featuresText}
            onChange={handleChange}
            placeholder={'8 créditos libres para elegir días y horarios\nCancelación sin cargo hasta 4 hs antes'}
            className="w-full rounded-xl bg-surface-container-low border border-outline-variant/60 px-3.5 py-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-1">
          <label className="inline-flex items-center gap-2 text-body-sm text-on-surface cursor-pointer">
            <input
              type="checkbox"
              data-testid="package-popular-checkbox"
              name="isPopular"
              checked={formData.isPopular}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-secondary"
            />
            <span>Destacar como &quot;Más Elegido&quot; en la landing</span>
          </label>

          <label className="inline-flex items-center gap-2 text-body-sm text-on-surface cursor-pointer">
            <input
              type="checkbox"
              data-testid="package-active-checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-secondary"
            />
            <span>Visible y habilitado</span>
          </label>
        </div>

        <div className="pt-4 border-t border-surface-container-high flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            data-testid="package-form-cancel-btn"
            onClick={onClose}
            disabled={isSaving}
          >
            <span>Cancelar</span>
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            data-testid="package-form-submit-btn"
            disabled={isSaving}
          >
            <span>{isSaving ? 'Guardando...' : editingPackage ? 'Guardar cambios' : 'Crear paquete'}</span>
          </Button>
        </div>
      </form>
    </dialog>
  );
}
