const HOURS_24 = Array.from({ length: 24 }, (_, idx) => String(idx).padStart(2, '0'));
const MINUTES_60 = Array.from({ length: 60 }, (_, idx) => String(idx).padStart(2, '0'));

/**
 * 24-hour time selector (HH:mm) independent of browser/OS locale.
 */
export default function Time24Input({
  id,
  value = '18:00',
  onChange,
  disabled = false,
  ariaLabel = 'Horario en formato 24 horas',
  testId,
  className = '',
}) {
  const [rawHour = '18', rawMinute = '00'] = String(value || '18:00').split(':');
  const hour = HOURS_24.includes(rawHour) ? rawHour : '18';
  const minute = MINUTES_60.includes(rawMinute) ? rawMinute : '00';

  const emitChange = (nextHour, nextMinute) => {
    onChange?.(`${nextHour}:${nextMinute}`);
  };

  return (
    <div
      data-testid={testId}
      className={`inline-flex items-center rounded-lg border border-outline-variant bg-surface-container-lowest px-1.5 py-1 text-body-sm font-semibold text-primary focus-within:border-primary ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      <div className="relative">
        <select
          id={id}
          aria-label={`${ariaLabel} - hora`}
          data-testid={testId ? `${testId}-hour` : undefined}
          value={hour}
          disabled={disabled}
          onChange={(e) => emitChange(e.target.value, minute)}
          className="appearance-none bg-transparent py-0.5 pl-1.5 pr-5 text-body-sm font-semibold text-primary focus:outline-none cursor-pointer"
        >
          {HOURS_24.map((hh) => (
            <option key={hh} value={hh}>
              {hh}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-1 flex items-center text-on-surface-variant"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>

      <span aria-hidden="true" className="px-0.5 text-on-surface-variant">
        :
      </span>

      <div className="relative">
        <select
          aria-label={`${ariaLabel} - minutos`}
          data-testid={testId ? `${testId}-minute` : undefined}
          value={minute}
          disabled={disabled}
          onChange={(e) => emitChange(hour, e.target.value)}
          className="appearance-none bg-transparent py-0.5 pl-1.5 pr-5 text-body-sm font-semibold text-primary focus:outline-none cursor-pointer"
        >
          {MINUTES_60.map((mm) => (
            <option key={mm} value={mm}>
              {mm}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-1 flex items-center text-on-surface-variant"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>
    </div>
  );
}
