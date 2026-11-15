import React from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';

/**
 * Reusable SearchBar Molecule
 * Composes Input and Button atoms with an explicit clear ("Limpiar") action.
 */
export default function SearchBar({
  id = 'search-input',
  value,
  onChange,
  onClear,
  placeholder = 'Buscar...',
  ariaLabel = 'Buscar',
  clearLabel = 'Limpiar',
  testIdPrefix = 'search',
}) {
  return (
    <div
      data-testid={`${testIdPrefix}-bar`}
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs"
    >
      <Input
        id={id}
        name={id}
        type="search"
        icon="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        data-testid={`${testIdPrefix}-input`}
        className="flex-1"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClear}
        disabled={!value}
        data-testid={`${testIdPrefix}-clear-btn`}
        className="shrink-0 cursor-pointer"
      >
        {clearLabel}
      </Button>
    </div>
  );
}
