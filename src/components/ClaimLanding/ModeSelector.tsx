import React, { useRef, useCallback } from 'react';
import type { ClaimMode, RadioOptionConfig } from './types';
import styles from './ModeSelector.module.css';

export interface ModeSelectorProps {
  selectedMode: ClaimMode | null;
  onSelectMode: (mode: ClaimMode) => void;
  options: RadioOptionConfig[];
}

const GROUP_LABEL_ID = 'mode-selector-label';

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  options,
}) => {
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const focusOption = useCallback((index: number) => {
    optionRefs.current[index]?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      const { key } = event;

      if (key === 'ArrowDown' || key === 'ArrowRight') {
        event.preventDefault();
        const nextIndex = (index + 1) % options.length;
        onSelectMode(options[nextIndex].id);
        focusOption(nextIndex);
      } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
        event.preventDefault();
        const prevIndex = (index - 1 + options.length) % options.length;
        onSelectMode(options[prevIndex].id);
        focusOption(prevIndex);
      } else if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        onSelectMode(options[index].id);
      }
    },
    [options, onSelectMode, focusOption]
  );

  const getTabIndex = (optionId: ClaimMode, index: number): number => {
    if (selectedMode === null) {
      return index === 0 ? 0 : -1;
    }
    return optionId === selectedMode ? 0 : -1;
  };

  return (
    <div>
      <span id={GROUP_LABEL_ID} className={styles.groupLabel}>
        Seleccione modalidad
      </span>
      <div
        role="radiogroup"
        aria-labelledby={GROUP_LABEL_ID}
        className={styles.radiogroup}
      >
        {options.map((option, index) => {
          const isSelected = option.id === selectedMode;
          return (
            <div
              key={option.id}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              role="radio"
              aria-checked={isSelected}
              tabIndex={getTabIndex(option.id, index)}
              className={`${styles.option}${isSelected ? ` ${styles.optionSelected}` : ''}`}
              onClick={() => onSelectMode(option.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <div className={styles.optionHeader}>
                <span className={styles.title}>{option.title}</span>
                {option.badge && (
                  <span className={styles.badge}>{option.badge}</span>
                )}
              </div>
              <p className={styles.description}>{option.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
