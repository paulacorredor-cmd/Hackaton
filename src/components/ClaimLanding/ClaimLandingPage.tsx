import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ClaimMode } from './types';
import { ROUTES, MODE_OPTIONS } from './constants';
import { HeaderBar } from './HeaderBar';
import { BackLink } from './BackLink';
import { InfoBanner } from './InfoBanner';
import { ModeSelector } from './ModeSelector';
import { StartButton } from './StartButton';
import { ActionCard } from './ActionCard';
import styles from './ClaimLandingPage.module.css';

export const ClaimLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<ClaimMode | null>(null);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const handleStartProcess = () => {
    if (selectedMode === 'assisted') {
      navigate(ROUTES.assistedFlow);
    } else if (selectedMode === 'self-service') {
      navigate(ROUTES.selfServiceFlow);
    }
  };

  const handleCloseBanner = () => {
    setIsBannerVisible(false);
  };

  const handleViewRequirements = () => {
    navigate(ROUTES.requirements);
  };

  return (
    <div className={styles.page}>
      <HeaderBar logoSrc="/logo-davivienda.svg" logoAlt="Davivienda" />
      <div className={styles.content}>
        <BackLink href={ROUTES.back} />
        <InfoBanner
          isVisible={isBannerVisible}
          onClose={handleCloseBanner}
          onViewRequirements={handleViewRequirements}
          title="Consejos para hacer su reporte más rápido"
          requirementsLinkText="Ver requisitos"
        />
        <h1 className={styles.title}>Comience su solicitud</h1>
        <p className={styles.subtitle}>
          Vamos a resolverlo juntos, comience por elegir como desea tramitar su solicitud.
        </p>
        <div className={styles.modeSection}>
          <ModeSelector
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
            options={MODE_OPTIONS}
          />
        </div>
        <div className={styles.startButtonWrapper}>
          <StartButton
            isEnabled={selectedMode !== null}
            onClick={handleStartProcess}
          />
        </div>
        <p className={styles.existingRequestsText}>
          Continúe su solicitud o verifique el estado de su caso de reclamación.
        </p>
        <div className={styles.actionCards}>
          <ActionCard
            title="Retome su solicitud"
            description="¿Dejó algo pendiente? Finalice aquí el envío de su información."
            iconSrc="/icon-resume.svg"
            iconAlt="Retomar solicitud"
            onClick={() => navigate(ROUTES.resumeRequest)}
          />
          <ActionCard
            title="Consulte su solicitud"
            description="Revise aquí el avance y los detalles de su solicitud."
            iconSrc="/icon-status.svg"
            iconAlt="Consultar solicitud"
            onClick={() => navigate(ROUTES.checkStatus)}
          />
        </div>
      </div>
    </div>
  );
};
