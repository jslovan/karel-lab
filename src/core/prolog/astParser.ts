import type { ASTItem } from '../../types/karel';

/**
 * Tokenizes Karel input string into a list of atom strings for Prolog DCG parsing.
 * Strips comments (# and //) and wraps [ and ] with whitespace markers.
 */
export function tokenizeKarel(input: string): string[] {
  const tokens: string[] = [];
  const lines = input.split('\n');
  
  for (let line of lines) {
    const hashIdx = line.indexOf('#');
    if (hashIdx !== -1) line = line.substring(0, hashIdx);
    const slashIdx = line.indexOf('//');
    if (slashIdx !== -1) line = line.substring(0, slashIdx);
    
    line = line.replace(/\[/g, ' lsquare ').replace(/\]/g, ' rsquare ');
    
    const words = line.trim().split(/\s+/).filter(w => w.length > 0);
    for (const w of words) {
      tokens.push(w);
    }
  }
  return tokens;
}

/**
 * Converts a Tau Prolog term object into a valid Prolog source string representation.
 */
export function termToPrologString(term: any): string {
  if (term === null || term === undefined) return 'null';
  if (typeof term === 'string') {
    if (term === 'TRUE' || term === 'FALSE' || /^[A-Z]/.test(term)) {
      return `'${term}'`;
    }
    return term;
  }
  if (typeof term === 'number') return String(term);
  if (term.id === '[]') return '[]';
  if (term.id === '.') {
    const list: string[] = [];
    let curr = term;
    while (curr && curr.id === '.' && curr.args && curr.args.length === 2) {
      list.push(termToPrologString(curr.args[0]));
      curr = curr.args[1];
    }
    return `[${list.join(', ')}]`;
  }
  if (term.id === 'TRUE' || term.id === 'FALSE') {
    return `'${term.id}'`;
  }
  if (term.args && term.args.length > 0) {
    const argsStr = term.args.map((a: any) => termToPrologString(a)).join(', ');
    const functor = term.id;
    return `${functor}(${argsStr})`;
  }
  const id = term.id || String(term);
  if (id === 'TRUE' || id === 'FALSE' || /^[A-Z]/.test(id)) {
    return `'${id}'`;
  }
  return id;
}

/**
 * Serializes an ASTItem back to its Prolog term representation for reduce_step.
 */
export function astItemToPrologString(item: any): string {
  if (!item) return 'null';
  if (typeof item === 'string') {
    if (item === 'TRUE' || item === 'FALSE' || /^[A-Z]/.test(item)) {
      return `'${item}'`;
    }
    return item;
  }
  if (typeof item === 'number') return String(item);
  if (item.rawProlog) {
    return item.rawProlog;
  }
  if (item.type === 'builtin') {
    return `builtin(${item.internal}, ${item.label})`;
  }
  if (item.type === 'routine') {
    return `routine(${item.name})`;
  }
  if (item.type === 'opakuj') {
    const bodyStr = (item.body || []).map(astItemToPrologString).join(', ');
    return `abstract(opakuj, ${item.label}, ${item.count}, [${bodyStr}])`;
  }
  if (item.type === 'dokud') {
    const predStr = typeof item.predObj !== 'undefined'
      ? termToPrologString(item.predObj)
      : (item.condition === 'TRUE' || item.condition === 'FALSE' ? `'${item.condition}'` : item.condition);
    const bodyStr = (item.body || []).map(astItemToPrologString).join(', ');
    return `abstract(dokud, ${item.label}, ${predStr}, [${bodyStr}])`;
  }
  if (item.type === 'kdyz') {
    const predStr = typeof item.predObj !== 'undefined'
      ? termToPrologString(item.predObj)
      : (item.condition === 'TRUE' || item.condition === 'FALSE' ? `'${item.condition}'` : item.condition);
    const thenStr = (item.then || []).map(astItemToPrologString).join(', ');
    const elseStr = (item.else || []).map(astItemToPrologString).join(', ');
    return `abstract(kdyz, ${item.label}, ${predStr}, [${thenStr}], [${elseStr}])`;
  }
  return termToPrologString(item);
}

/**
 * Formats predicate terms into human-readable strings (e.g., "neni zed", "je znacka", "TRUE").
 */
export function formatPred(predTerm: any): string {
  if (!predTerm) return '';
  if (typeof predTerm === 'string') return predTerm;
  if (predTerm.name === 'TRUE' || predTerm.name === 'FALSE' || predTerm.id === 'TRUE' || predTerm.id === 'FALSE') {
    return predTerm.name || predTerm.id;
  }
  if (predTerm.name === 'predicate' && predTerm.args) {
    const [kind, _token, sensor] = predTerm.args;
    let sensorStr = '';
    if (sensor && sensor.name === 'sensor' && sensor.args) {
      const [sName, sToken] = sensor.args;
      if (Array.isArray(sToken)) {
        sensorStr = sToken.join(' ');
      } else {
        sensorStr = sToken || sName;
      }
    } else if (typeof sensor === 'string') {
      sensorStr = sensor;
    }
    const kindStr = typeof kind === 'string' ? kind : (kind?.name || 'je');
    return `${kindStr} ${sensorStr}`.trim();
  }
  return typeof predTerm.name === 'string' ? predTerm.name : (typeof predTerm.id === 'string' ? predTerm.id : JSON.stringify(predTerm));
}

/**
 * Parses a single Prolog term into an ASTItem structure.
 */
export function parsePrologASTItem(term: any): any {
  if (!term) return null;
  if (typeof term === 'string' || typeof term === 'number') return term;
  
  const id = term.id;
  const args = term.args;
  const rawProlog = termToPrologString(term);

  if (id === 'builtin' && args && args.length === 2) {
    const internal = args[0].id || args[0];
    const displayToken = args[1].id || args[1];
    return {
      type: 'builtin',
      internal,
      label: displayToken,
      rawProlog
    };
  }
  
  if (id === 'routine' && args && args.length === 1) {
    const name = args[0].id || args[0];
    return {
      type: 'routine',
      name,
      label: name,
      rawProlog
    };
  }
  
  if (id === 'abstract' && args) {
    const kind = args[0].id || args[0];
    const token = args[1].id || args[1];
    
    if (kind === 'opakuj' && args.length === 4) {
      const n = args[2].value !== undefined ? args[2].value : args[2];
      const body = parsePrologASTList(args[3]);
      return {
        type: 'opakuj',
        label: token,
        count: typeof n === 'number' ? n : parseInt(n, 10) || 1,
        body,
        rawProlog
      };
    }
    
    if (kind === 'dokud' && args.length === 4) {
      const predObj = parsePrologASTItem(args[2]);
      const body = parsePrologASTList(args[3]);
      return {
        type: 'dokud',
        label: token,
        condition: typeof predObj === 'string' ? predObj : formatPred(predObj),
        predObj,
        body,
        rawProlog
      };
    }
    
    if (kind === 'kdyz' && args.length === 5) {
      const predObj = parsePrologASTItem(args[2]);
      const astTrue = parsePrologASTList(args[3]);
      const astFalse = parsePrologASTList(args[4]);
      return {
        type: 'kdyz',
        label: token,
        condition: typeof predObj === 'string' ? predObj : formatPred(predObj),
        predObj,
        then: astTrue,
        else: astFalse,
        rawProlog
      };
    }
  }

  if (!args || args.length === 0) {
    return id;
  }
  
  if (id === '.') {
    return parsePrologASTList(term);
  }
  
  return {
    name: id,
    args: args.map(parsePrologASTItem),
    rawProlog
  };
}

/**
 * Parses a Prolog linked list term (. / []) into an array of ASTItems.
 */
export function parsePrologASTList(term: any): ASTItem[] {
  if (!term || term.id === '[]') return [];
  const list: ASTItem[] = [];
  let curr = term;
  while (curr && curr.id === '.' && curr.args && curr.args.length === 2) {
    list.push(parsePrologASTItem(curr.args[0]));
    curr = curr.args[1];
  }
  return list;
}

export interface StructuredPrologError {
  status: 'error';
  errorType: 'syntax' | 'runtime' | 'unknown';
  context: string[];
  message: string;
  rawString: string;
}

/**
 * Parses structured error terms error(Type, ContextList, Message) from Tau Prolog exception objects.
 */
export function parsePrologErrorTerm(ans: any): StructuredPrologError {
  const result: StructuredPrologError = {
    status: 'error',
    errorType: 'unknown',
    context: [],
    message: '',
    rawString: ''
  };

  if (!ans) {
    result.message = 'Neznámá chyba';
    return result;
  }

  result.rawString = typeof ans.toString === 'function' ? ans.toString() : String(ans);

  if (ans.id === 'throw' && ans.args && ans.args.length > 0) {
    const errTerm = ans.args[0];
    if (errTerm && errTerm.id === 'error' && errTerm.args) {
      // Structured 3-arg format: error(Type, ContextList, Msg)
      if (errTerm.args.length >= 3) {
        const typeArg = errTerm.args[0];
        const ctxArg = errTerm.args[1];
        const msgArg = errTerm.args[2];

        const typeStr = typeArg?.id || (typeof typeArg === 'string' ? typeArg : '');
        result.errorType = typeStr === 'runtime' ? 'runtime' : 'syntax';

        // Extract context linked list into string array
        const ctxList: string[] = [];
        let curr = ctxArg;
        while (curr && curr.id === '.' && curr.args && curr.args.length === 2) {
          const item = curr.args[0];
          const val = item?.value !== undefined ? item.value : (item?.id || String(item));
          ctxList.push(String(val));
          curr = curr.args[1];
        }
        result.context = ctxList;

        const msgVal = msgArg?.value !== undefined ? msgArg.value : (msgArg?.id || String(msgArg));
        result.message = String(msgVal);
        return result;
      }

      // Single arg fallback: error(Detail)
      if (errTerm.args.length === 1) {
        const detail = errTerm.args[0];
        const msgVal = detail?.value !== undefined ? detail.value : (detail?.id || detail?.toString());
        result.message = String(msgVal);
        return result;
      }
    }

    if (typeof errTerm.value === 'string') {
      result.message = errTerm.value;
      return result;
    }
  }

  result.message = result.rawString;
  return result;
}

/**
 * Extracts human-readable error messages from Tau Prolog exception terms.
 */
export function getPrologError(ans: any): string {
  const parsed = parsePrologErrorTerm(ans);
  return parsed.message || parsed.rawString || 'Neznámá chyba';
}
