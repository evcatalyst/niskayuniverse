import { initMap } from './map.js';
import { initForm } from './form.js';

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initForm();
});
