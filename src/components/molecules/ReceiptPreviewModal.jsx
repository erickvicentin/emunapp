import React from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';

/**
 * Modal to preview an uploaded transfer receipt image and metadata.
 */
export default function ReceiptPreviewModal({ dialogRef, payment, onClose }) {
  return (
    <dialog
      ref={dialogRef}
      data-testid="receipt-preview-dialog"
      aria-labelledby="receipt-preview-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 text-on-surface shadow-xl"
    >
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high">
        <div>
          <h3 id="receipt-preview-title" className="font-headline-sm text-headline-sm font-semibold text-primary">
            Comprobante de Pago
          </h3>
          <p className="text-body-sm text-on-surface-variant">
            {payment?.alumnoNombre} • {payment?.paqueteNombre}
          </p>
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

      <div className="mt-4 space-y-3">
        <div className="rounded-xl bg-surface-container-low p-3 text-body-sm space-y-1">
          <p>
            <strong>N° Operación:</strong> {payment?.numeroOperacion || 'No informado'}
          </p>
          <p>
            <strong>Archivo:</strong> {payment?.comprobanteNombre || 'Sin archivo adjunto'}
          </p>
        </div>

        {payment?.comprobanteDataUrl?.startsWith('data:image/') ? (
          <img
            src={payment.comprobanteDataUrl}
            alt="Comprobante de transferencia"
            className="w-full max-h-80 object-contain rounded-xl border border-outline-variant bg-surface-container-low"
          />
        ) : (
          <p className="py-8 text-center text-body-sm text-on-surface-variant rounded-xl border border-dashed border-outline-variant">
            Vista previa de imagen no disponible para este archivo.
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-surface-container-high flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          <span>Cerrar</span>
        </Button>
      </div>
    </dialog>
  );
}
