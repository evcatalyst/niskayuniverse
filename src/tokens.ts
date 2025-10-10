import { colorFor, type Palette } from './palette';

export interface ServiceLineFeature {
  id: string;
  address: string;
  private_type: string;
  public_type: string;
  verified: boolean;
  confidence: number;
  last_verified: string;
}

export interface MarkerConfig {
  palette: Palette;
  tokenSize: number;
  ringInset: number;
  style: 'split' | 'nested' | 'donut' | 'hex' | 'halo' | 'band' | 'pin';
  patterns: boolean;
  pulseLead: boolean;
  dashedUnknown: boolean;
  lodCityMax: number;
  lodNhoodMax: number;
  lodCityStyle: 'split' | 'nested' | 'donut' | 'hex' | 'halo' | 'band' | 'pin';
  lodNhoodStyle: 'split' | 'nested' | 'donut' | 'hex' | 'halo' | 'band' | 'pin';
  lodParcelStyle: 'split' | 'nested' | 'donut' | 'hex' | 'halo' | 'band' | 'pin';
  tooltipFields: string[];
  showLegend: boolean;
  cluster: boolean;
  clusterMinPts: number;
  animation: boolean;
  verifiedOutline: boolean;
}

export function anyLead(feature: ServiceLineFeature): boolean {
  return feature.private_type === 'lead' || feature.public_type === 'lead';
}

export function anyUnknown(feature: ServiceLineFeature): boolean {
  return feature.private_type === 'unknown' || feature.public_type === 'unknown';
}

export function createTokenElement(feature: ServiceLineFeature, config: MarkerConfig): HTMLElement {
  const element = document.createElement('div');
  element.className = 'marker';
  element.setAttribute('tabindex', '0');
  element.setAttribute('aria-label', `Service line marker for ${feature.address}: private ${feature.private_type}, public ${feature.public_type}`);
  element.style.setProperty('--token-size', `${config.tokenSize}px`);
  element.style.setProperty('--ring-inset-percent', `${config.ringInset}%`);
  element.style.setProperty('--private-color', colorFor(feature.private_type, config));
  element.style.setProperty('--public-color', colorFor(feature.public_type, config));

  // Apply variant
  element.classList.add(config.style);

  // Apply states
  if (config.pulseLead && anyLead(feature) && config.animation) {
    element.classList.add('pulse-lead');
  }
  if (config.dashedUnknown && anyUnknown(feature)) {
    element.classList.add('outline-unknown');
  }
  if (config.verifiedOutline && feature.verified) {
    element.classList.add('outline-verified');
  }

  // Unknown pattern
  if (config.patterns && anyUnknown(feature)) {
    element.classList.add('unknown-pattern');
  }

  return element;
}