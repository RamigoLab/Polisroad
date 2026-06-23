/**
 * pages.js – PolisRoad
 * Re-export aggregato degli stili per sezione.
 * Importare con: import { PS } from '../styles/pages';
 *
 * I file per sezione si trovano in src/styles/pages/
 */
import { home }        from './pages/home';
import { prontuario }  from './pages/prontuario';
import { normativa }   from './pages/normativa';
import { ricerca }     from './pages/ricerca';
import { calcolatore } from './pages/calcolatore';
import { news }        from './pages/news';
import { profilo }     from './pages/profilo';
import { operatore }   from './pages/operatore';
import { admin }       from './pages/admin';

export const PS = {
  ...home,
  ...prontuario,
  ...normativa,
  ...ricerca,
  ...calcolatore,
  ...news,
  ...profilo,
  ...operatore,
  ...admin,
};
