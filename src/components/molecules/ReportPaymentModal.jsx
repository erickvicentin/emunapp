import React, { useRef, useState } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import SelectChevron from '../atoms/SelectChevron';
import { extractReceiptMetadata } from '../../utils/receiptParser';
import { formatArsPrice, getPackageNumericPrice } from '../../services/packageService';

const EMPTY_LIST = [];

/**
 * Modal for customers to report a transfer or cash payment notice,
 * with automatic receipt metadata extraction (operation ID & amount).
 */
export default function ReportPaymentModal({
  dialogRef,
  packages = EMPTY_LIST,
  cobrosConfig,
  isMutating = false,
  onClose,
  onSubmit,
}) {
  const activePackages = packages.filter((p) => p.active !== false);
  const [packageId, setPackageId] = useState('');
  const [metodoPago, setMetodoPago] = useState('transferencia');
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [montoInformado, setMontoInformado] = useState('');
  const [parseStatus, setParseStatus] = useState('');
  const receiptMetaRef = useRef({ name: '', dataUrl: '' });

  const selectedPkg = activePackages.find((p) => p.id === packageId) || activePackages[0];
  const selectedPkgPrice = getPackageNumericPrice(selectedPkg);
  const displayAmount = montoInformado || (selectedPkgPrice ? String(selectedPkgPrice) : '');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    receiptMetaRef.current = { name: file.name, dataUrl: '' };
    setParseStatus('Analizando comprobante...');
    try {
      const meta = await extractReceiptMetadata(file);
      if (meta.operationNumber) setNumeroOperacion(meta.operationNumber);
      if (meta.amount) setMontoInformado(String(meta.amount));
      receiptMetaRef.current = { name: file.name, dataUrl: meta.previewDataUrl || '' };
      setParseStatus(
        meta.operationNumber
          ? `Detectado N° de operación ${meta.operationNumber}. Verificá los datos antes de enviar.`
          : 'Comprobante adjuntado. Verificá o completá el N° de operación.'
      );
    } catch {
      setParseStatus('No se pudo leer automáticamente; completá los datos manualmente.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPkg) return;
    const ok = await onSubmit?.({
      pkg: selectedPkg,
      metodoPago,
      numeroOperacion,
      montoInformado: Number(displayAmount) || selectedPkgPrice,
      comprobanteNombre: receiptMetaRef.current.name,
      comprobanteDataUrl: receiptMetaRef.current.dataUrl,
    });
    if (ok) {
      setNumeroOperacion('');
      setMontoInformado('');
      receiptMetaRef.current = { name: '', dataUrl: '' };
      setParseStatus('');
      onClose?.();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      data-testid="customer-report-payment-dialog"
      aria-labelledby="report-payment-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 text-on-surface shadow-xl"
    >
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Aviso de Pago
          </span>
          <h2 id="report-payment-title" className="font-headline-sm text-headline-sm font-semibold text-primary">
            Cargar créditos / Reportar pago
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label htmlFor="customer-pkg-select" className="block text-label-md font-semibold text-primary">
            Paquete de clases
          </label>
          <div className="relative w-full">
            <select
              id="customer-pkg-select"
              data-testid="customer-payment-package-select"
              value={selectedPkg?.id || ''}
              onChange={(e) => {
                setPackageId(e.target.value);
                setMontoInformado('');
              }}
              className="w-full appearance-none rounded-xl border border-outline-variant bg-surface-container-low pl-3 pr-10 py-2.5 text-body-md cursor-pointer"
            >
              {activePackages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.classesCount} clases) — {formatArsPrice(getPackageNumericPrice(p))}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="customer-method-select" className="block text-label-md font-semibold text-primary">
            Forma de pago
          </label>
          <div className="relative w-full">
            <select
              id="customer-method-select"
              data-testid="customer-payment-method-select"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full appearance-none rounded-xl border border-outline-variant bg-surface-container-low pl-3 pr-10 py-2.5 text-body-md cursor-pointer"
            >
              <option value="transferencia">Transferencia bancaria</option>
              <option value="efectivo">Efectivo en el estudio</option>
            </select>
            <SelectChevron />
          </div>
        </div>

        {metodoPago === 'transferencia' && (
          <div className="space-y-3 rounded-xl border border-surface-container-high bg-surface-container-low p-3.5">
            <div className="text-body-sm space-y-0.5">
              <p className="font-semibold text-primary">Datos para transferir:</p>
              <p>
                Alias:{' '}
                <code
                  data-testid="customer-transfer-alias"
                  className="font-mono font-semibold text-secondary"
                >
                  {cobrosConfig?.alias || cobrosConfig?.aliasCbu || '—'}
                </code>
              </p>
              {cobrosConfig?.cvu && (
                <p>
                  CVU:{' '}
                  <code data-testid="customer-transfer-cvu" className="font-mono font-semibold text-primary">
                    {cobrosConfig.cvu}
                  </code>
                </p>
              )}
              <p>
                Titular:{' '}
                <span data-testid="customer-transfer-titular" className="font-medium text-primary">
                  {cobrosConfig?.titularCuenta || '—'}
                </span>
              </p>
              {cobrosConfig?.cuilCuit && (
                <p>
                  CUIL / CUIT:{' '}
                  <code data-testid="customer-transfer-cuil" className="font-mono font-medium text-primary">
                    {cobrosConfig.cuilCuit}
                  </code>
                </p>
              )}
            </div>

            <label className="block space-y-1">
              <span className="block text-label-sm font-semibold text-primary">
                Adjuntar comprobante (imagen o PDF)
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                data-testid="customer-receipt-file-input"
                className="w-full text-body-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-on-primary cursor-pointer"
              />
            </label>

            {parseStatus && (
              <p data-testid="customer-receipt-parse-status" className="text-xs text-secondary font-medium">
                {parseStatus}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="block text-label-sm font-semibold text-primary">N° de operación</span>
                <input
                  type="text"
                  value={numeroOperacion}
                  onChange={(e) => setNumeroOperacion(e.target.value)}
                  placeholder="Ej: 9876543210"
                  data-testid="customer-operation-input"
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-label-sm font-semibold text-primary">Monto ($)</span>
                <input
                  type="number"
                  min="1"
                  value={displayAmount}
                  onChange={(e) => setMontoInformado(e.target.value)}
                  data-testid="customer-amount-input"
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm"
                  required
                />
              </label>
            </div>
          </div>
        )}

        <p className="text-xs text-on-surface-variant">
          Al enviar el aviso recibirás créditos provisorios para reservar de inmediato mientras Administración confirma el cobro (plazo: {cobrosConfig?.horasVencimientoProvisorio || 24} hs).
        </p>

        <div className="pt-3 border-t border-surface-container-high flex justify-end gap-3">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            <span>Cancelar</span>
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!selectedPkg || isMutating}
            data-testid="customer-report-payment-submit-btn"
          >
            <span>{isMutating ? 'Enviando...' : 'Enviar aviso'}</span>
          </Button>
        </div>
      </form>
    </dialog>
  );
}
