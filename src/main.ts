import './presentation/styles/index.css';
import { App } from './presentation/App';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (root) {
    new App(root);
  }
});
