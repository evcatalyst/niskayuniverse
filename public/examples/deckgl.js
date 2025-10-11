import { Deck } from 'https://unpkg.com/deck.gl@8.9.0/dist.min.js';
import { ScatterplotLayer } from 'https://unpkg.com/deck.gl@8.9.0/dist.min.js';

const config = {
  palette: 'palette-okabe',
  tokenSize: 24,
  ringInset: 34,
  style: 'halo',
  patterns: true,
  pulseLead: true,
  dashedUnknown: true,
  verifiedOutline: false,
  animation: true,
  showLegend: true,
  cluster: false,
  clusterMinPts: 3,
  lodCityMax: 12,
  lodNhoodMax: 15,
  lodCityStyle: 'halo',
  lodNhoodStyle: 'nested',
  lodParcelStyle: 'split',
  tooltipFields: ['address', 'private_type', 'public_type']
};

let deck;
let data = [];

async function init() {
  // Load data
  try {
    const response = await fetch('../data/markers.json');
    data = await response.json();
  } catch (error) {
    console.error('Failed to load markers:', error);
    // Fallback data
    data = [
      {
        id: 'parcel_1',
        address: '123 Main St',
        private_type: 'copper',
        public_type: 'lead',
        verified: true,
        confidence: 0.85,
        last_verified: '2024-11-12',
        position: [-74.5, 40]
      }
    ];
  }

  // Ensure all data has positions
  data.forEach((d, i) => {
    if (!d.position) {
      d.position = [-73.85 + (Math.random() - 0.5) * 0.1, 42.78 + (Math.random() - 0.5) * 0.1];
    }
  });

  deck = new Deck({
    container: 'container',
    initialViewState: {
      longitude: -73.85,
      latitude: 42.78,
      zoom: 13
    },
    controller: true,
    layers: [createLayer()]
  });
}

function createLayer() {
  return new ScatterplotLayer({
    id: 'service-markers',
    data,
    getPosition: d => d.position,
    getRadius: config.tokenSize / 2,
    getFillColor: d => getColor(d.public_type),
    stroked: true,
    getLineColor: d => getColor(d.private_type),
    getLineWidth: 2,
    pickable: true,
    onHover: ({ object }) => {
      if (object) {
        console.log(object.address, object.private_type, object.public_type);
      }
    }
  });
}

function getColor(material) {
  switch (material) {
    case 'lead': return [213, 94, 0];
    case 'copper': return [0, 158, 115];
    case 'galvanized': return [0, 114, 178];
    case 'plastic': return [204, 121, 167];
    default: return [189, 189, 189];
  }
}

init();