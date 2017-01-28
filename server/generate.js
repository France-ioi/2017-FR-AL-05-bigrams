
const seedrandom = require('seedrandom');
const shuffle = require('shuffle-array');

const sentences = require('./sentences');

module.exports = generate;

const difficultCardinalities = {
  k: 1 /* 0.0 */,
  w: 1 /* 0.1 */,
  z: 1 /* 0.1 */,
  x: 1 /* 0.2 */,
  y: 1 /* 0.2 */,
  j: 1 /* 0.3 */,
  g: 1 /* 0.4 */,
  h: 1 /* 0.4 */,
  b: 1 /* 0.5 */,
  f: 1 /* 0.5 */,
  q: 1 /* 0.7 */,
  v: 1 /* 0.8 */,
  m: 1 /* 1.5 */,
  p: 1 /* 1.5 */,
  c: 1 /* 1.7 */,
  d: 1 /* 1.8 */,
  l: 2 /* 2.7 */,
  o: 2 /* 2.7 */,
  u: 2 /* 3.2 */,
  r: 3 /* 3.3 */,
  n: 3 /* 3.5 */,
  t: 4 /* 3.6 */,
  i: 4 /* 3.8 */,
  s: 4 /* 4.0 */,
  a: 4 /* 4.1 */,
  e: 6 /* 8.6 */
};

function generate (params, seed, callback) {
  const {version} = params;
  const rng = seedrandom(seed);
  const minLength = version === 1 ? 400 : 2000;
  const maxLength = minLength + 50;
  const clearSymbols = getClearSymbols(difficultCardinalities);
  const decipherSubst = shuffle(clearSymbols, {copy: true, rng: rng});
  const cipherSubst = getCipherSubstitution(decipherSubst);
  const withSpaces = false; /* not supported by task */
  const clearText = sentences.generate(rng, minLength, maxLength, withSpaces).toLowerCase();
  const cipherText = applySubstitution(rng, cipherSubst, clearText);
  const task = {version, cipherText, hints: {}};
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
