import React from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

/**
 * PaginationBar Molecule
 * Reusable pagination controls with item range summary and prev/next buttons.
 */
export default function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPrevPage,
  onNextPage,
  testIdPrefix = 'table',
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginación"
      data-testid={`${testIdPrefix}-pagination`}
      className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-surface-container-low border border-surface-container-high"
    >
      <p
        data-testid={`${testIdPrefix}-pagination-info`}
        className="text-body-sm text-on-surface-variant"
      >
        Mostrando <strong className="text-primary">{startIndex}–{endIndex}</strong> de{' '}
        <strong className="text-primary">{totalItems}</strong> • Página{' '}
        <strong className="text-primary">{currentPage}</strong> de{' '}
        <strong className="text-primary">{totalPages}</strong>
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          data-testid={`${testIdPrefix}-pagination-prev`}
          onClick={onPrevPage}
          className="bg-surface-container-lowest"
        >
          <Icon name="chevron_left" className="text-[18px] mr-1" />
          <span>Anterior</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          data-testid={`${testIdPrefix}-pagination-next`}
          onClick={onNextPage}
          className="bg-surface-container-lowest"
        >
          <span>Siguiente</span>
          <Icon name="chevron_right" className="text-[18px] ml-1" />
        </Button>
      </div>
    </nav>
  );
}
