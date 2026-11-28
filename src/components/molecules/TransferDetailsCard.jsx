import React, { useEffect, useRef, useState } from 'react';
import Icon from '../atoms/Icon';

function CopyableField({ label, value, valueTestId, buttonTestId, isCopied, onCopy }) {
  return (
    <div className="rounded-xl bg-surface-container-low/70 border border-surface-container-high/80 px-3.5 py-2.5 flex flex-col justify-between gap-2.5">
      <div className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>
        <code
          data-testid={valueTestId}
          className="block font-mono text-[13px] sm:text-body-sm font-semibold text-primary break-all mt-0.5"
        >
          {value}
        </code>
      </div>

      <button
        type="button"
        data-testid={buttonTestId}
        aria-label={`Copiar ${label}`}
        onClick={onCopy}
        className={`w-full sm:w-auto sm:self-end inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors cursor-pointer ${
          isCopied
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800'
            : 'bg-surface-container-lowest border-outline-variant text-primary hover:bg-surface-container'
        }`}
      >
        <Icon name={isCopied ? 'check' : 'content_copy'} className="text-[15px]" />
        <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
      </button>
    </div>
  );
}

/**
 * TransferDetailsCard Molecule
 * Displays destination bank account details clearly on mobile and desktop
 * with one-click copy buttons for Alias and CVU/CBU.
 */
export default function TransferDetailsCard({ cobrosConfig }) {
  const [copiedField, setCopiedField] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const aliasValue = cobrosConfig?.alias || cobrosConfig?.aliasCbu || '—';
  const cvuValue = cobrosConfig?.cvu || '';

  const handleCopy = async (field, text) => {
    if (!text || text === '—') return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Ignore clipboard errors in restricted contexts
    }
  };

  return (
    <div
      data-testid="customer-payments-bank-details"
      className="p-4 sm:p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon name="account_balance" className="text-[20px] text-secondary shrink-0" />
          <p className="font-label-sm uppercase tracking-wider text-secondary font-semibold">
            Datos para transferir
          </p>
        </div>
        <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant">
          Plazo provisorio: {cobrosConfig?.horasVencimientoProvisorio || 24} hs
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <CopyableField
          label="Alias"
          value={aliasValue}
          valueTestId="customer-payments-alias"
          buttonTestId="copy-alias-btn"
          isCopied={copiedField === 'alias'}
          onCopy={() => handleCopy('alias', aliasValue)}
        />

        {cvuValue ? (
          <CopyableField
            label="CVU / CBU"
            value={cvuValue}
            valueTestId="customer-payments-cvu"
            buttonTestId="copy-cvu-btn"
            isCopied={copiedField === 'cvu'}
            onCopy={() => handleCopy('cvu', cvuValue)}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-body-sm text-on-surface-variant pt-0.5">
        <span>
          Titular:{' '}
          <strong data-testid="customer-payments-titular" className="font-medium text-primary">
            {cobrosConfig?.titularCuenta || '—'}
          </strong>
        </span>
        {cobrosConfig?.cuilCuit ? (
          <span>
            CUIL/CUIT:{' '}
            <code data-testid="customer-payments-cuil" className="font-mono font-medium text-primary">
              {cobrosConfig.cuilCuit}
            </code>
          </span>
        ) : null}
      </div>
    </div>
  );
}
