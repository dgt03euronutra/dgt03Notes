import './styles.scss';
import { initAgenda } from './agenda';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  initAgenda(app);
}
