import type React from 'react';
import { SORT_OPTIONS, type SortKey } from '../constants';

interface SortDropdownProps {
  isOpen: boolean;
  sortKey: SortKey;
  activeLabel: string;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSelect: (value: SortKey) => void;
}

export function SortDropdown({
  isOpen,
  sortKey,
  activeLabel,
  dropdownRef,
  onToggle,
  onSelect,
}: SortDropdownProps) {
  return (
    <div className={`sort-dd${isOpen ? ' open' : ''}`} ref={dropdownRef}>
      <button
        className="sort-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>{activeLabel}</span>
        <svg className="sort-chevron" viewBox="0 0 24 24" aria-hidden="true">
          <use href="#icon-chevron-down" />
        </svg>
      </button>

      {isOpen && (
        <ul className="sort-options" role="listbox" tabIndex={-1}>
          {SORT_OPTIONS.map(option => (
            <li
              key={option.value}
              className={`sort-opt${option.value === sortKey ? ' selected' : ''}`}
              role="option"
              aria-selected={option.value === sortKey}
              tabIndex={0}
              onClick={event => {
                event.stopPropagation();
                onSelect(option.value);
              }}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(option.value);
                }
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
