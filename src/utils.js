import {SYMBOL_DIGITS, NUM_SYMBOLS} from './constants';

export function symbolToDisplayString(symbol) {
  return ('0000' + symbol).slice(-SYMBOL_DIGITS);
};

export function symbolsToDisplayString(symbols) {
  return symbols.map(symbolToDisplayString).join("");
};

export function letterToDisplayString(letter) {
  if(letter === null || letter === undefined || letter === "") {
    return "?";
  }
  return letter;
};

export function symbolsToDisplayLetters(substitution, symbols) {
  return symbols.map(symbol => letterToDisplayString(substitution[symbol].letter)).join("");
};

export function letterToEditString(letter) {
  if(letter === null || letter === undefined || letter === "") {
    return "";
  }
  return letter;
};

const UPPERCASE_START = "A".charCodeAt(0);
const UPPERCASE_END = "Z".charCodeAt(0);
const DIGIT_START = "0".charCodeAt(0);
const DIGIT_END = "9".charCodeAt(0);

export function isLegalLetter(letter) {
  if(letter === null || letter === undefined || letter === "") {
    return true;
  }
  const charCode = letter.charCodeAt(0);
  return charCode >= UPPERCASE_START && charCode <= UPPERCASE_END;
};

const isLegalBigramCharacters = function(value, charType) {
  let legalCodeStart;
  let legalCodeEnd;
  if(charType === "symbols") {
    legalCodeStart = DIGIT_START;
    legalCodeEnd = DIGIT_END;
  }
  else {
    legalCodeStart = UPPERCASE_START;
    legalCodeEnd = UPPERCASE_END;
  }
  for(let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if(code < legalCodeStart || code > legalCodeEnd) {
      return false;
    }
  }
  return true;
};

export function isLegalBigram(value, charType, allowPartial) {
  let maxLength;
  if(charType === "symbols") {
    maxLength = SYMBOL_DIGITS * 2;
  }
  else {
    maxLength = 2;
  }
  if(value.length > maxLength) {
    return false;
  }
  if(!allowPartial && value.length !== maxLength) {
    return false;
  }
  if(!isLegalBigramCharacters(value, charType)) {
    return false;
  }
  if(!allowPartial && charType === "symbols") {
    const first = parseInt(value.substring(0, SYMBOL_DIGITS));
    const second = parseInt(value.substring(SYMBOL_DIGITS));
    if(first < 0 || first >= NUM_SYMBOLS || second < 0 || second >= NUM_SYMBOLS) {
      return false;
    }
  }
  return true;
};

const isOccurrence = function(cipherText, substitution, index, keys, searchBigrams) {
  if(searchBigrams) {
    if(index === cipherText.length - 1) {
      return false;
    }
    const symbolsString = symbolToDisplayString(cipherText[index]) + symbolToDisplayString(cipherText[index + 1]);
    const lettersString = substitution[cipherText[index]].letter + substitution[cipherText[index + 1]].letter;
    return keys[symbolsString] || keys[lettersString];
  }
  else {
    return keys[cipherText[index]];
  }
};

export function findOccurrence(cipherText, substitution, startIndex, direction, keys, searchBigrams) {
  for(let dummyIndex = 0; dummyIndex < cipherText.length; dummyIndex++) {
    let index = (startIndex + dummyIndex * direction + cipherText.length) % cipherText.length;
    if(isOccurrence(cipherText, substitution, index, keys, searchBigrams)) {
      return index;
    }
  }
  return null;
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
