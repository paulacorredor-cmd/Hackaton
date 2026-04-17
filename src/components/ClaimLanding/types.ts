export type ClaimMode = 'assisted' | 'self-service';

export interface RadioOptionConfig {
  id: ClaimMode;
  title: string;
  description: string;
  badge?: string;
}

export interface LandingPageState {
  selectedMode: ClaimMode | null;
  isBannerVisible: boolean;
}
