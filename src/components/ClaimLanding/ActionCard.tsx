import React from 'react';
import styles from './ActionCard.module.css';

export interface ActionCardProps {
  title: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
  onClick: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  iconSrc,
  iconAlt,
  onClick,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <img className={styles.icon} src={iconSrc} alt={iconAlt} />
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>
      <svg
        className={styles.arrow}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );
};
