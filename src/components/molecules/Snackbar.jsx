import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../atoms/Icon';

const EXIT_ANIMATION_MS = 240;

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
  position = 'bottom-right',
}) {
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef(null);

  const triggerClose = useCallback(() => {
    if (exitTimerRef.current) return;
    setIsExiting(true);
    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null;
      setIsExiting(false);
      onClose?.();
    }, EXIT_ANIMATION_MS);
  }, [onClose]);

  useEffect(() => {
    if (!open || !message) return undefined;
    const timer = setTimeout(() => {
      triggerClose();
    }, duration);
    return () => {
      clearTimeout(timer);
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [open, message, duration, triggerClose]);

  if (!open || !message) {
    return null;
  }

  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.success;
  const positionClass = position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-6';

  return (
    <div
      data-testid="snackbar"
      data-variant={variant}
      data-position={position}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`fixed ${positionClass} z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto rounded-2xl border px-4 py-3.5 flex items-center gap-3 ${
        isExiting ? 'SnackbarFloating--exit' : 'SnackbarFloating'
      } ${styles.container}`}
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
        onClick={triggerClose}
        className="p-1 rounded-full hover:bg-black/15 transition-colors cursor-pointer shrink-0"
      >
        <Icon name="close" className="text-[18px]" />
      </button>
    </div>
  );
}
