
import {SYMBOL_DIGITS, NUM_BIGRAMS_SEARCH} from './constants';


const UPPERCASE_START = "A".charCodeAt(0);
const UPPERCASE_END = "Z".charCodeAt(0);
const DIGIT_START = "0".charCodeAt(0);
const DIGIT_END = "9".charCodeAt(0);

export function isValidLetter (letter) {
  return /^[A-Z]$/.test(letter);
}

export function isValidSymbolPair (bigram) {
  return bigram.length === SYMBOL_DIGITS * 2 && /^[0-9]+$/.test(bigram);
}

export function isValidLetterPair (bigram) {
  return bigram.length === 2 && /^[A-Z]+$/.test(bigram);
}

export function letterToDisplayString (letter) {
  return letter === null ? '\xA0' : letter;
}

export function symbolsToDisplayLetters (substitution, symbols) {
  return symbols.map(symbol =>
    letterToDisplayString(substitution[symbol].letter)).join("");
}

export function symbolToDisplayString (symbol) {
  return ('0000' + symbol).slice(-SYMBOL_DIGITS);
}

export function symbolsToDisplayString (symbols) {
  return symbols.map(symbolToDisplayString).join("");
}

const compareAnalysisCounts = function (object1, object2) {
  return object2.count - object1.count;
};

export function analyzeAuxiliary (cipherText, bigrams, repeated) {
  const info = {};
  function incrementMainCount (symbolArray) {
    const keyString = symbolsToDisplayString(symbolArray);
    if (!info[keyString]) {
      info[keyString] = {
        symbolArray: symbolArray,
        count: 0,
        before: {},
        after: {}
      };
    }
    info[keyString].count++;
  }
  function incrementAdjacentCount (symbolArray, otherSymbol, side) {
    const keyString = symbolsToDisplayString(symbolArray);
    const sideObject = info[keyString][side];
    if (!sideObject[otherSymbol]) {
      sideObject[otherSymbol] = {
        count: 0
      };
    }
    sideObject[otherSymbol].count++;
  }

  const chunkSize = bigrams ? 2 : 1;
  const lastIndex = cipherText.length - chunkSize;
  for (let index = 0; index <= lastIndex; index++) {

    const symbolArray = [cipherText[index]];
    if (bigrams) {
      symbolArray.push(cipherText[index + 1]);
      if (repeated && symbolArray[0] !== symbolArray[1]) {
        continue;
      }
    }

    const indexBefore = index - 1;
    const indexAfter = index + chunkSize;

    incrementMainCount(symbolArray);
    if (indexBefore >= 0) {
      incrementAdjacentCount(symbolArray, cipherText[indexBefore], "before");
    }
    if (indexAfter < cipherText.length) {
      incrementAdjacentCount(symbolArray, cipherText[indexAfter], "after");
    }
  }

  const result = [];
  for (let keyString in info) {
    const infoObject = info[keyString];
    const beforeArray = [];
    const afterArray = [];
    for (let otherSymbol in infoObject.before) {
      beforeArray.push({
        symbol: otherSymbol,
        count: infoObject.before[otherSymbol].count
      });
    }
    for (let otherSymbol in infoObject.after) {
      afterArray.push({
        symbol: otherSymbol,
        count: infoObject.after[otherSymbol].count
      });
    }
    beforeArray.sort(compareAnalysisCounts);
    beforeArray.splice(12);
    beforeArray.reverse();
    afterArray.sort(compareAnalysisCounts);
    afterArray.splice(12)
    result.push({
      symbolArray: infoObject.symbolArray,
      symbolString: symbolsToDisplayString(infoObject.symbolArray),
      count: infoObject.count,
      before: beforeArray,
      after: afterArray
    });
  }

  result.sort(compareAnalysisCounts);
  return result;
}

export function analyze (cipherText) {
  return {
    symbols: analyzeAuxiliary(cipherText, false, false),
    bigrams: analyzeAuxiliary(cipherText, true, false),
    repeatedBigrams: analyzeAuxiliary(cipherText, true, true)
  };
}


/* Build an initial dump when the task is loaded. */
export function makeDump (task) {
  const numSymbols = task.hints.length;
  const symbolAttrs = new Array(numSymbols).fill({letter: ''});
  const highlightedBigramSymbols = new Array(NUM_BIGRAMS_SEARCH).fill(''); // ['0102', ...]
  const highlightedBigramLetters = new Array(NUM_BIGRAMS_SEARCH).fill(''); // ['EN', ...]
  const searchCursor = {first: -1, last: -1};
  const filters = {symbols: false, bigrams: false};
  const analysisMode = 'symbols';
  const repeatedBigrams = false;
  return {symbolAttrs, highlightedBigramSymbols, highlightedBigramLetters, searchCursor, filters, analysisMode, repeatedBigrams};
}


/* Return a state with the workspace initialized for the given dump. */
export function initWorkspace (state, dump) {
  const analysis = analyze(state.taskData.cipherText);
  return updateWorkspace({...state, analysis, taskReady: true}, dump);
}

/* Update the state by rebuilding a workspace for the given dump. */
export function updateWorkspace (state, dump) {
  const {taskData: task} = state;
  const {cipherText, hints} = task;
  const numSymbols = hints.length;
  /* Highlighting maps */
  const highlightedSymbols = new Map(); // symbols → true
  const highlightedLetters = new Map(); // letters → true

  /* Hints override user input in the substitution. */
  const {symbolAttrs} = dump;
  /* symbolAttrs : array symbol → {letter, highlight} */
  const substitution = new Array(numSymbols);
  for (let symbol = 0; symbol < numSymbols; symbol++) {
    const symbolStr = symbolToDisplayString(symbol);
    const hint = hints[symbol];
    const attrs = symbolAttrs[symbol];
    const target = substitution[symbol] = {symbol};
    let letter = null;
    if (isValidLetter(hint)) {
      letter = hint;
      target.isHint = true;
    } else if (isValidLetter(attrs.letter)) {
      letter = attrs.letter;
    }
    target.letter = letter;
    if (attrs.isLocked) {
      target.isLocked = true;
    }
    if (typeof attrs.highlight === 'number') {
      target.highlight = attrs.highlight;
      highlightedSymbols.set(symbolStr, attrs.highlight);
    }
  }

  /* Mark highlighted pairs of symbols and letters. */
  dump.highlightedBigramSymbols.forEach(function (bigram) {
    if (isValidSymbolPair(bigram)) {
      highlightedSymbols.set(bigram, true);
    }
  });
  dump.highlightedBigramLetters.forEach(function (bigram) {
    if (isValidLetterPair(bigram)) {
      highlightedLetters.set(bigram, true);
    }
  });

  /* Apply the substitution and highlighting */
  const combinedText = [];
  let lastLetter = null, lastSymbol = '??', lastCell;
  for (let iSymbol = 0; iSymbol < cipherText.length; iSymbol++) {
    const symbol = cipherText[iSymbol];
    const symbolStr = symbolToDisplayString(symbol);
    const target = substitution[symbol];
    const letter = target ? target.letter : null;
    const bigramSymbols = lastSymbol + symbolStr;
    const bigramLetters = `${letterToDisplayString(lastLetter)}${letterToDisplayString(letter)}`;
    const cell = {index: iSymbol, symbol: symbolStr, letter};
    if (target.isHint) {
      cell.isHint = true;
    }
    if (target.isLocked) {
      cell.isLocked = true;
    }
    if (highlightedSymbols.has(symbolStr)) {
      cell.hlSymbol = true;
      cell.highlight = highlightedSymbols.get(symbolStr);
    }
    if (highlightedSymbols.has(bigramSymbols) || highlightedLetters.has(bigramLetters)) {
      lastCell.highlight = 0;
      lastCell.hlBigramFirst = true;
      cell.highlight = 0;
      cell.hlBigramSecond = true;
    }
    combinedText.push(cell);
    lastSymbol = symbolStr;
    lastLetter = letter;
    lastCell = cell;
  }

  // Select and filter analysis.
  const {analysisMode, filters} = dump;
  let analysis;
  if (analysisMode === 'symbols') {
    analysis = state.analysis.symbols;
  } else if (analysisMode === 'bigrams') {
    if (dump.repeatedBigrams) {
      analysis = state.analysis.repeatedBigrams;
    } else {
      analysis = state.analysis.bigrams;
    }
  }
  if (filters[analysisMode]) {
    analysis = analysis.filter(function (obj) {
      const displayLetters = symbolsToDisplayLetters(substitution, obj.symbolArray);
      return highlightedSymbols.has(obj.symbolString) ||
        highlightedLetters.has(displayLetters);
    });
  }

  const workspace = {numSymbols, combinedText, substitution, analysis};
  return {...state, dump, workspace};
}
