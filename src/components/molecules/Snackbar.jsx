import React, { useEffect } from 'react';
import Icon from '../atoms/Icon';

const VARIANT_STYLES = {
  success: {
    container:
      'bg-primary text-on-primary border-primary/20 shadow-xl',
    icon: 'check_circle',
  },
  error: {
    container:
      'bg-error text-on-error border-error/30 shadow-xl',
    icon: 'error',
  },
};

/**
 * Snackbar Molecule
 * Floating bottom-right notification banner for async action feedback (success/error).
 */
export default function Snackbar({
  open,
  variant = 'success',
  message,
  onClose,
  duration = 4500,
}) {
  useEffect(() => {
    if (!open || !message) return undefined;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [open, message, duration, onClose]);

  if (!open || !message) {
    return null;
  }

  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.success;

  return (
    <div
      data-testid="snackbar"
      data-variant={variant}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`SnackbarFloating fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto rounded-2xl border px-4 py-3.5 flex items-center gap-3 ${styles.container}`}
    >
      <Icon name={styles.icon} className="text-[22px] shrink-0" />
      <p
        data-testid="snackbar-message"
        className="font-body-sm text-[13px] font-medium flex-1 leading-snug"
      >
        {message}
      </p>
      <button
        type="button"
        data-testid="snackbar-close-btn"
        aria-label="Cerrar notificación"
        onClick={onClose}
        className="p-1 rounded-full hover:bg-black/15 transition-colors cursor-pointer shrink-0"
      >
        <Icon name="close" className="text-[18px]" />
      </button>
    </div>
  );
}
