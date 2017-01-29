
import {SYMBOL_DIGITS} from './constants';

const UPPERCASE_START = "A".charCodeAt(0);
const UPPERCASE_END = "Z".charCodeAt(0);
const DIGIT_START = "0".charCodeAt(0);
const DIGIT_END = "9".charCodeAt(0);

export function isValidLetter (letter) {
  return /^[A-Z]$/.test(letter);
};

export function isValidSymbolPair (bigram) {
  return bigram.length === SYMBOL_DIGITS * 2 && /^[0-9]+$/.test(bigram);
};

export function isValidLetterPair (bigram) {
  return bigram.length === 2 && /^[A-Z]+$/.test(bigram);
};

export function letterToDisplayString(letter) {
  return letter === null ? '?' : letter;
};

export function symbolsToDisplayLetters(substitution, symbols) {
  return symbols.map(symbol =>
    letterToDisplayString(substitution[symbol].letter)).join("");
};

export function symbolToDisplayString(symbol) {
  return ('0000' + symbol).slice(-SYMBOL_DIGITS);
};

export function symbolsToDisplayString(symbols) {
  return symbols.map(symbolToDisplayString).join("");
};

const compareAnalysisCounts = function(object1, object2) {
  return object2.count - object1.count;
};

export function analyzeAuxiliary(cipherText, bigrams) {
  const info = {};
  function incrementMainCount(symbolArray) {
    const keyString = symbolsToDisplayString(symbolArray);
    if(!info[keyString]) {
      info[keyString] = {
        symbolArray: symbolArray,
        count: 0,
        before: {},
        after: {}
      };
    }
    info[keyString].count++;
  }
  function incrementAdjacentCount(symbolArray, otherSymbol, side) {
    const keyString = symbolsToDisplayString(symbolArray);
    const sideObject = info[keyString][side];
    if(!sideObject[otherSymbol]) {
      sideObject[otherSymbol] = {
        count: 0
      };
    }
    sideObject[otherSymbol].count++;
  }

  for(let index = 0; index < cipherText.length; index++) {
    if(bigrams && index === cipherText.length - 1) {
      break;
    }

    const symbolArray = [cipherText[index]];
    if(bigrams) {
      symbolArray.push(cipherText[index + 1]);
    }

    const indexBefore = index - 1;
    let indexAfter = index + 1;
    if(bigrams) {
      indexAfter = index + 2;
    }

    incrementMainCount(symbolArray);
    if(indexBefore >= 0) {
      incrementAdjacentCount(symbolArray, cipherText[indexBefore], "before");
    }
    if(indexAfter < cipherText.length) {
      incrementAdjacentCount(symbolArray, cipherText[indexAfter], "after");
    }
  }

  const result = [];
  for(let keyString in info) {
    const infoObject = info[keyString];
    const beforeArray = [];
    const afterArray = [];
    for(let otherSymbol in infoObject.before) {
      beforeArray.push({
        symbolArray: [otherSymbol],
        count: infoObject.before[otherSymbol].count
      });
    }
    for(let otherSymbol in infoObject.after) {
      afterArray.push({
        symbolArray: [otherSymbol],
        count: infoObject.after[otherSymbol].count
      });
    }
    beforeArray.sort(compareAnalysisCounts);
    afterArray.sort(compareAnalysisCounts);
    result.push({
      symbolArray: infoObject.symbolArray,
      count: infoObject.count,
      before: beforeArray,
      after: afterArray
    });
  }
  result.sort(compareAnalysisCounts);
  return result;
};

export function analyze(cipherText) {
  return {
    symbols: analyzeAuxiliary(cipherText, false),
    bigrams: analyzeAuxiliary(cipherText, true)
  };
};
