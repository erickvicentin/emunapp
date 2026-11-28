import React, { useMemo, useRef, useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Input from '../atoms/Input';
import { isDeliverableStudentEmail } from '../../services/noticeService';

const MAX_SUBJECT_LENGTH = 160;
const MAX_BODY_LENGTH = 5000;
const EMPTY_STUDENTS = [];

function validateNoticeField(field, value) {
  const trimmed = String(value || '').trim();
  if (field === 'subject') {
    if (!trimmed) return 'Ingresá el asunto del aviso.';
    if (trimmed.length > MAX_SUBJECT_LENGTH) {
      return `El asunto no puede superar los ${MAX_SUBJECT_LENGTH} caracteres.`;
    }
    return null;
  }
  if (field === 'body') {
    if (!trimmed) return 'Escribí el cuerpo del mensaje antes de enviar.';
    if (trimmed.length > MAX_BODY_LENGTH) {
      return `El mensaje no puede superar los ${MAX_BODY_LENGTH} caracteres.`;
    }
    return null;
  }
  return null;
}

function NoticeRecipientSummary({ activeCount, eligibleCount, skippedCount }) {
  return (
    <div
      data-testid="admin-notice-recipients-summary"
      className="p-4 rounded-xl bg-surface-container border border-outline-variant/60 flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0 mt-0.5">
        <Icon name="group" className="text-[20px]" />
      </div>
      <div className="space-y-0.5">
        <p className="font-label-md text-label-md text-primary font-semibold">
          Destinatarios: {eligibleCount} {eligibleCount === 1 ? 'alumno activo' : 'alumnos activos'} con email válido
        </p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Se enviará únicamente a alumnos con estado <strong>activo</strong> ({activeCount} en total).
          {skippedCount > 0 && ` ${skippedCount} sin correo real configurado serán omitidos.`}
        </p>
      </div>
    </div>
  );
}

function NoticeEmailPreview({ subject, body }) {
  const displayTitle = subject.trim() || 'Asunto del aviso';
  const rawParagraphs = body
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const seenCounts = new Map();
  const paragraphs = rawParagraphs.map((text) => {
    const count = (seenCounts.get(text) || 0) + 1;
    seenCounts.set(text, count);
    return { key: `${text.slice(0, 24)}-${count}`, text };
  });

  return (
    <aside
      data-testid="admin-notice-preview"
      aria-label="Vista previa del correo"
      className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-3"
    >
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-surface-container-high">
        <h2 className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center gap-2">
          <Icon name="visibility" className="text-secondary text-[20px]" />
          <span>Vista previa del email</span>
        </h2>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Diseño Emuná Pilates
        </span>
      </div>

      <div className="rounded-xl bg-surface p-3 sm:p-4 border border-outline-variant/50">
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-lowest shadow-xs">
          <div className="bg-primary-container px-5 py-4 border-b-[3px] border-secondary flex items-center gap-3">
            <img
              src="/logo-email.jpg"
              alt="Emuná Pilates"
              className="w-9 h-9 rounded-full object-cover border border-secondary shrink-0"
            />
            <div>
              <p className="font-headline-sm text-white text-[15px] font-semibold leading-tight">
                Emuná Pilates
              </p>
              <p className="text-[9px] font-semibold tracking-widest uppercase text-secondary-fixed-dim mt-0.5">
                Movimiento Consciente
              </p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <h3 className="font-headline-sm text-[17px] font-semibold text-primary leading-snug break-words">
              {displayTitle}
            </h3>
            <p className="font-body-sm text-[13px] text-on-surface-variant">
              Hola Sofía,
            </p>

            <div className="space-y-2.5 text-[13px] leading-relaxed text-on-surface-variant text-justify break-words">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph) => (
                  <p key={paragraph.key} className="whitespace-pre-line">
                    {paragraph.text}
                  </p>
                ))
              ) : (
                <p className="italic text-on-surface-variant/60">
                  El cuerpo del mensaje aparecerá aquí con alineación justificada y la identidad visual del estudio.
                </p>
              )}
            </div>

            <div className="pt-2">
              <span className="inline-block bg-secondary text-on-secondary px-4 py-2 rounded-lg text-[12px] font-semibold">
                Ir a Emuná Pilates
              </span>
            </div>
          </div>

          <div className="px-5 py-3 bg-surface-container-low border-t border-surface-container-high text-[11px] leading-snug text-on-surface-variant">
            Este es un correo automático enviado desde una casilla sin respuesta (no-reply). Si tenés dudas, contactate directamente con el estudio.
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * AdminNoticeSection Organism
 * Dedicated page for administrators to compose and send branded email notices
 * with justified body text to all active students.
 */
export default function AdminNoticeSection({
  students = EMPTY_STUDENTS,
  onSendNotice,
  showSnackbar,
}) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const subjectInputRef = useRef(null);
  const bodyInputRef = useRef(null);

  const recipientStats = useMemo(() => {
    const activeStudents = students.filter((student) => student.active !== false);
    const eligibleEmails = new Set();
    let skippedCount = 0;

    for (const student of activeStudents) {
      const email = String(student.email || '').trim().toLowerCase();
      if (isDeliverableStudentEmail(email)) {
        eligibleEmails.add(email);
      } else {
        skippedCount += 1;
      }
    }

    return {
      activeCount: activeStudents.length,
      eligibleCount: eligibleEmails.size,
      skippedCount,
    };
  }, [students]);

  const handleSubjectChange = (e) => {
    const value = e.target.value;
    setSubject(value);
    if (errors.subject) {
      setErrors((prev) => ({ ...prev, subject: validateNoticeField('subject', value) }));
    }
  };

  const handleBodyChange = (e) => {
    const value = e.target.value;
    setBody(value);
    if (errors.body) {
      setErrors((prev) => ({ ...prev, body: validateNoticeField('body', value) }));
    }
  };

  const handleBlur = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateNoticeField(field, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const subjectError = validateNoticeField('subject', subject);
    const bodyError = validateNoticeField('body', body);

    if (subjectError || bodyError) {
      setTouched({ subject: true, body: true });
      setErrors({ subject: subjectError, body: bodyError });
      showSnackbar?.('error', 'Completá el asunto y el mensaje antes de enviar el aviso.');
      if (subjectError) {
        subjectInputRef.current?.focus();
      } else {
        bodyInputRef.current?.focus();
      }
      return;
    }

    setIsSending(true);
    setLastResult(null);
    try {
      const result = await onSendNotice({ subject, body });
      setLastResult(result);
      if (result.sentCount > 0) {
        showSnackbar?.(
          'success',
          `Aviso enviado a ${result.sentCount} ${result.sentCount === 1 ? 'alumno activo' : 'alumnos activos'}.`
        );
        setSubject('');
        setBody('');
        setErrors({});
        setTouched({});
      } else {
        showSnackbar?.(
          'error',
          'No se pudo enviar el aviso a ningún destinatario. Verificá los correos o la configuración SMTP.'
        );
      }
    } catch (err) {
      showSnackbar?.('error', err?.message || 'Ocurrió un error al enviar el aviso.');
    } finally {
      setIsSending(false);
    }
  };

  const bodyErrorId = errors.body ? 'notice-body-error' : undefined;
  const bodyHelperId = !errors.body ? 'notice-body-helper' : undefined;
  const bodyBorderState = errors.body
    ? 'border-error focus:ring-error/40'
    : 'border-outline-variant focus:border-secondary focus:ring-secondary/30';

  return (
    <div data-testid="admin-notice-section" className="space-y-5">
      <section className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xs">
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
          Módulo de Administración • Emuná Pilates
        </span>
        <h1
          data-testid="admin-notice-title"
          className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1"
        >
          Emitir aviso
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Redactá y enviá un comunicado institucional por correo electrónico a todos los alumnos con estado activo.
        </p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby="admin-notice-form-heading"
          data-testid="admin-notice-form"
          className="xl:col-span-7 p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-5"
        >
          <div className="pb-3 border-b border-surface-container-high">
            <h2
              id="admin-notice-form-heading"
              className="font-headline-sm text-headline-sm text-primary font-semibold flex items-center gap-2"
            >
              <Icon name="campaign" className="text-secondary text-[20px]" />
              <span>Redactar comunicado</span>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              El texto se enviará con formato justificado y el diseño oficial de Emuná Pilates.
            </p>
          </div>

          <NoticeRecipientSummary
            activeCount={recipientStats.activeCount}
            eligibleCount={recipientStats.eligibleCount}
            skippedCount={recipientStats.skippedCount}
          />

          <Input
            ref={subjectInputRef}
            id="notice-subject"
            name="subject"
            label="Asunto del email"
            value={subject}
            onChange={handleSubjectChange}
            onBlur={() => handleBlur('subject', subject)}
            placeholder="Ej: Horarios especiales de diciembre y feriados"
            icon="subject"
            required
            maxLength={MAX_SUBJECT_LENGTH}
            error={touched.subject ? errors.subject : null}
            helperText={`${subject.length}/${MAX_SUBJECT_LENGTH} caracteres`}
            data-testid="admin-notice-subject-input"
          />

          <div className="space-y-space-xs">
            <label
              htmlFor="notice-body"
              className="block font-label-md text-label-md text-on-surface"
            >
              Cuerpo del mensaje
              <span className="text-secondary ml-1" aria-hidden="true">*</span>
            </label>
            <textarea
              ref={bodyInputRef}
              id="notice-body"
              name="body"
              rows={8}
              required
              maxLength={MAX_BODY_LENGTH}
              value={body}
              onChange={handleBodyChange}
              onBlur={() => handleBlur('body', body)}
              placeholder="Escribí aquí el comunicado para tus alumnos..."
              aria-invalid={Boolean(touched.body && errors.body)}
              aria-describedby={bodyErrorId || bodyHelperId}
              data-testid="admin-notice-body-input"
              className={`w-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 rounded-xl p-4 font-body-md text-body-md transition-colors outline-none focus:ring-2 shadow-xs border resize-y min-h-[180px] text-justify ${bodyBorderState}`}
            />
            {touched.body && errors.body ? (
              <p
                id="notice-body-error"
                className="font-body-sm text-body-sm text-error flex items-center gap-1 mt-1"
              >
                <Icon name="error" className="text-[16px]" />
                <span>{errors.body}</span>
              </p>
            ) : (
              <p
                id="notice-body-helper"
                className="font-body-sm text-body-sm text-on-surface-variant mt-1"
              >
                Separando con una línea en blanco creás párrafos. ({body.length}/{MAX_BODY_LENGTH} caracteres)
              </p>
            )}
          </div>

          {lastResult && (
            <div
              role="status"
              aria-live="polite"
              data-testid="admin-notice-result-banner"
              className="p-4 rounded-xl bg-surface-container border border-secondary/30 text-body-sm text-on-surface space-y-1"
            >
              <p className="font-semibold text-primary">Resultado del último envío</p>
              <p className="text-on-surface-variant">
                Enviados: <strong>{lastResult.sentCount}</strong> • Fallidos:{' '}
                <strong>{lastResult.failedCount}</strong> • Omitidos sin email:{' '}
                <strong>{lastResult.skippedNoEmailCount}</strong>
              </p>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              variant="secondary"
              size="md"
              disabled={isSending}
              data-testid="admin-notice-submit-btn"
            >
              <Icon name="send" className="text-[18px] mr-2" />
              <span>{isSending ? 'Enviando aviso...' : 'Enviar aviso a alumnos activos'}</span>
            </Button>
          </div>
        </form>

        <div className="xl:col-span-5">
          <NoticeEmailPreview subject={subject} body={body} />
        </div>
      </div>
    </div>
  );
}
