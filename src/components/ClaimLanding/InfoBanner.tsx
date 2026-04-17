import React from 'react';
import styles from './InfoBanner.module.css';

export interface InfoBannerProps {
  isVisible: boolean;
  onClose: () => void;
  onViewRequirements: () => void;
  title: string;
  requirementsLinkText: string;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({
  isVisible,
  onClose,
  onViewRequirements,
  title,
  requirementsLinkText,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.banner} role="status">
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <button
          type="button"
          className={styles.link}
          onClick={onViewRequirements}
        >
          {requirementsLinkText}
        </button>
      </div>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Cerrar banner"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};
