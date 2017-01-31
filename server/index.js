
const alkindiTaskServer = require('alkindi-task-lib/server');

alkindiTaskServer({
  webpackConfig: require('../webpack.config.js'),
  generate: require('./generate'),
  gradeAnswer,
  grantHint
});

function gradeAnswer (full_task, task, answer, callback) {
  const {clearText} = full_task;
  const sumbittedText = answer.clearText;
  const wrongMap = new Map();
  for (let iChar = 0; iChar < clearText.length; iChar += 1) {
    const correctCode = clearText.charCodeAt(iChar);
    const submittedCode = sumbittedText.charCodeAt(iChar);
    if (correctCode !== submittedCode && !wrongMap.has(correctCode)) {
      wrongMap.set(correctCode, submittedCode);
    }
  }
  const nErrors = wrongMap.size;
  const is_full_solution = nErrors === 0;
  const is_solution = nErrors <= 4;
  const feedback = is_solution ? nErrors : false;
  const highestPossibleScore = getHighestPossibleScore(task);
  const score = is_solution ? highestPossibleScore * (1 - 0.25 * nErrors) : 0;
  callback(null, {
    success: true, feedback, score, is_solution, is_full_solution
  });
}

function grantHint (full_task, task, query, callback) {
  const {index} = query;
  const {decipherSubst} = full_task;
  if (typeof index !== 'number' || index < 0 || index >= decipherSubst.length) {
    callback(null, {success: false});
  }
  // Update task in-place as it is freshly loaded JSON.
  task.hints[index] = decipherSubst[index];
  task.highestPossibleScore = getHighestPossibleScore(task);
  callback(null, {success: true, task: task});
};

function getHighestPossibleScore (task) {
  const {version, hints, baseScore, hintCost} = task;
  const nHints = hints.filter(x => x != null).length;
  return Math.max(0, baseScore - nHints * hintCost);
}
