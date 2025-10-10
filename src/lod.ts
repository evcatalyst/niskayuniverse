import type { MarkerConfig } from './tokens';

export type MarkerStyle = 'split' | 'nested' | 'donut' | 'hex' | 'halo' | 'band' | 'pin';

export function lodStyle(config: MarkerConfig, zoom: number): MarkerStyle {
  if (zoom <= config.lodCityMax) {
    return config.lodCityStyle;
  } else if (zoom <= config.lodNhoodMax) {
    return config.lodNhoodStyle;
  } else {
    return config.lodParcelStyle;
  }
}