import React from 'react';
import styles from './StartButton.module.css';

export interface StartButtonProps {
  isEnabled: boolean;
  onClick: () => void;
  label?: string;
}

export const StartButton: React.FC<StartButtonProps> = ({
  isEnabled,
  onClick,
  label = 'Iniciar proceso',
}) => {
  const handleClick = () => {
    if (isEnabled) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={`${styles.button}${!isEnabled ? ` ${styles.buttonDisabled}` : ''}`}
      aria-disabled={!isEnabled}
      onClick={handleClick}
    >
      {label}
    </button>
  );
};
