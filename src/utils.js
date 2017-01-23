import {SYMBOL_DIGITS, NUM_SYMBOLS} from './constants';

export function symbolToDisplayString(symbol) {
  return ('0000' + symbol).slice(-SYMBOL_DIGITS);
};

export function letterToDisplayString(letter) {
  if(letter === null || letter === undefined || letter === "") {
    return "?";
  }
  return letter;
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

export function analyzeSymbols(cipherText) {
  const counts = [];
  const beforeCounts = [];
  const afterCounts = [];
  for(let index = 0; index < NUM_SYMBOLS; index++) {
    counts.push(0);
    beforeCounts.push({});
    afterCounts.push({});
  }
  function incrementSideCount(array, anchor, other) {
    if(!array[anchor][other]) {
      array[anchor][other] = 0;
    }
    array[anchor][other]++;
  }
  for(let index = 0; index < cipherText.length; index++) {
    counts[cipherText[index]]++;
    if(index > 0) {
      incrementSideCount(beforeCounts, cipherText[index], cipherText[index - 1]);
    }
    if(index < cipherText.length - 1) {
      incrementSideCount(afterCounts, cipherText[index], cipherText[index + 1]);
    }
  }

  const symbolsResult = [];
  for(let index = 0; index < NUM_SYMBOLS; index++) {
    if(counts[index] === 0) {
      continue;
    }
    const beforeArray = [];
    const afterArray = [];
    for(let other in beforeCounts[index]) {
      beforeArray.push({
        symbol: other,
        count: beforeCounts[index][other]
      });
    }
    for(let other in afterCounts[index]) {
      afterArray.push({
        symbol: other,
        count: afterCounts[index][other]
      });
    }
    beforeArray.sort(compareAnalysisCounts);
    afterArray.sort(compareAnalysisCounts);
    symbolsResult.push({
      symbol: index,
      count: counts[index],
      before: beforeArray,
      after: afterArray
    });
  }
  symbolsResult.sort(compareAnalysisCounts);
  return symbolsResult;
};

export function analyze(cipherText) {
  return {
    symbols: analyzeSymbols(cipherText)
  };
};