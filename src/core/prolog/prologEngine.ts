import pl from 'tau-prolog';
import 'tau-prolog/modules/lists';
import { Language } from '../../types/karel';

import karelSrc from '../../karel_dcg.pl?raw';
import langCsSrc from '../../lang_cs.pl?raw';
import langEnSrc from '../../lang_en.pl?raw';

/**
 * Creates and initializes a Tau Prolog session consulted with the DCG and selected language grammar.
 */
export function createPrologSession(
  lang: Language,
  onSuccess: (session: any) => void,
  onError: (err: any) => void
): any {
  const session = pl.create(10000);
  const langSrc = lang === 'cs' ? langCsSrc : langEnSrc;
  
  session.consult(karelSrc + "\n" + langSrc, {
    success: () => {
      onSuccess(session);
    },
    error: (err: any) => {
      onError(err);
    }
  });

  return session;
}
