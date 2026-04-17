import React from 'react';
import { Link } from 'react-router-dom';
import styles from './BackLink.module.css';

export interface BackLinkProps {
  href: string;
  label?: string;
}

export const BackLink: React.FC<BackLinkProps> = ({ href, label = 'Volver' }) => {
  return (
    <Link to={href} className={styles.backLink}>
      <svg
        className={styles.arrow}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12.5 15L7.5 10L12.5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{label}</span>
    </Link>
  );
};
