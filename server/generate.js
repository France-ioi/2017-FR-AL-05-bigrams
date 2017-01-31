
const seedrandom = require('seedrandom');
const shuffle = require('shuffle-array');

const sentences = require('./sentences');

module.exports = generate;

const easyCardinalities = {
  K: 1 /* 0.0 */,
  W: 1 /* 0.1 */,
  Z: 1 /* 0.1 */,
  X: 1 /* 0.2 */,
  Y: 1 /* 0.2 */,
  J: 1 /* 0.3 */,
  G: 1 /* 0.4 */,
  H: 1 /* 0.4 */,
  B: 1 /* 0.5 */,
  F: 1 /* 0.5 */,
  Q: 1 /* 0.7 */,
  V: 1 /* 0.8 */,
  M: 1 /* 1.5 */,
  P: 1 /* 1.5 */,
  C: 1 /* 1.7 */,
  D: 1 /* 1.8 */,
  L: 1 /* 2.7 */,
  O: 1 /* 2.7 */,
  U: 1 /* 3.2 */,
  R: 1 /* 3.3 */,
  N: 1 /* 3.5 */,
  T: 1 /* 3.6 */,
  I: 2 /* 3.8 */,
  S: 2 /* 4.0 */,
  A: 2 /* 4.1 */,
  E: 2 /* 8.6 */
};

const difficultCardinalities = {
  K: 1 /* 0.0 */,
  W: 1 /* 0.1 */,
  Z: 1 /* 0.1 */,
  X: 1 /* 0.2 */,
  Y: 1 /* 0.2 */,
  J: 1 /* 0.3 */,
  G: 1 /* 0.4 */,
  H: 1 /* 0.4 */,
  B: 1 /* 0.5 */,
  F: 1 /* 0.5 */,
  Q: 1 /* 0.7 */,
  V: 1 /* 0.8 */,
  M: 1 /* 1.5 */,
  P: 1 /* 1.5 */,
  C: 1 /* 1.7 */,
  D: 1 /* 1.8 */,
  L: 2 /* 2.7 */,
  O: 2 /* 2.7 */,
  U: 2 /* 3.2 */,
  R: 3 /* 3.3 */,
  N: 3 /* 3.5 */,
  T: 4 /* 3.6 */,
  I: 4 /* 3.8 */,
  S: 4 /* 4.0 */,
  A: 4 /* 4.1 */,
  E: 6 /* 8.6 */
};

const baseScoreByVersion = [0, 200, 150];
const hintCostByVersion = [0, 20, 10];

function generate (params, seed, callback) {
  const {version} = params;
  const baseScore = baseScoreByVersion[version];
  const hintCost = hintCostByVersion[version];
  const rng = seedrandom(seed);
  const minLength = 6000;
  const maxLength = minLength + 50;
  const clearSymbols = getClearSymbols(version === 1 ? easyCardinalities : difficultCardinalities);
  const decipherSubst = shuffle(clearSymbols, {copy: true, rng: rng});
  const cipherSubst = getCipherSubstitution(decipherSubst);
  const withSpaces = false; /* not supported by task */
  const clearText = sentences.generate(rng, minLength, maxLength, withSpaces);
  const cipherText = applySubstitution(rng, cipherSubst, clearText);
  const task = {version, baseScore, hintCost, cipherText, hints: new Array(decipherSubst.length).fill(null)};
  const full_task = Object.assign({}, task, {clearText, cipherSubst, decipherSubst});
  callback(null, {task, full_task});
};

function getClearSymbols (cardinalities) {
  const symbols = [];
  Object.keys(cardinalities).forEach(function (symbol) {
    const cardinality = cardinalities[symbol];
    for (let i = 0; i < cardinality; i++) {
      symbols.push(symbol);
    }
  });
  return symbols.sort();
}

function getCipherSubstitution (decipherSubst) {
  const result = {};
  decipherSubst.forEach(function (symbol, index) {
    const alts = symbol in result ? result[symbol] : (result[symbol] = []);
    alts.push(index);
  });
  return result;
}

function applySubstitution (rng, subst, clearText) {
  const cipher = [];
  for (let iLetter = 0; iLetter < clearText.length; iLetter++) {
    const char = clearText.charAt(iLetter);
    if (char in subst) {
      const cipherSymbols = subst[char];
      // Equal probability of using each cipher symbol.
      const iSymbol = Math.trunc(rng() * cipherSymbols.length);
      cipher.push(cipherSymbols[iSymbol]);
    } else {
      cipher.push(char);
    }
  }
  return cipher;
}

// Run this module directly with node to test it.
if (require.main === module) {
   generate({version: 1}, '', function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result));
   });
}
