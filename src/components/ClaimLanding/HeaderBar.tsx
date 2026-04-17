import React from 'react';
import styles from './HeaderBar.module.css';

export interface HeaderBarProps {
  logoSrc: string;
  logoAlt: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ logoSrc, logoAlt }) => {
  return (
    <header className={styles.header}>
      <div className={styles.redStripe} />
      <div className={styles.logoBar}>
        <img src={logoSrc} alt={logoAlt} className={styles.logo} />
      </div>
    </header>
  );
};
