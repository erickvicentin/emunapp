/**
 * Reusable SVG downward chevron indicator for custom-styled <select> elements.
 */
export default function SelectChevron() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-on-surface-variant"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}
