import type React from 'react';

interface SortOption<T extends string> {
  value: T;
  label: string;
}

interface SortDropdownProps<T extends string> {
  isOpen: boolean;
  sortKey: T;
  activeLabel: string;
  options: SortOption<T>[];
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSelect: (value: T) => void;
}

export function SortDropdown<T extends string>({
  isOpen,
  sortKey,
  activeLabel,
  options,
  dropdownRef,
  onToggle,
  onSelect,
}: SortDropdownProps<T>) {
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

      <ul
        className="sort-options"
        role="listbox"
        tabIndex={-1}
        aria-hidden={!isOpen}
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            className={`sort-opt${option.value === sortKey ? ' selected' : ''}`}
            role="option"
            aria-selected={option.value === sortKey}
            tabIndex={isOpen ? 0 : -1}
            style={{ transitionDelay: isOpen ? `${index * 28}ms` : '0ms' }}
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
    </div>
  );
}
