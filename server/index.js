
const alkindiTaskServer = require('alkindi-task-lib/server');

alkindiTaskServer({
  webpackConfig: require('../webpack.config.js'),
  generate: require('./generate'),
  gradeAnswer,
  grantHint
});

function gradeAnswer (full_task, task, answer, callback) {
  // TODO grading.
  callback(null, {
    feedback: false, score: 0, is_solution: false, is_full_solution: false
  });
  return;
  const {secretKey} = full_task;
  const {key} = answer;
  let nCorrect = 0;
  secretKey.forEach(function (value, index) {
    if (value === key[index]) {
      nCorrect += 1;
    }
  });
  const is_full_solution = nCorrect === secretKey.length;
  const is_solution = is_full_solution;  // could be nCorrect > 0
  const feedback = is_full_solution;
  const highestPossibleScore = getHighestPossibleScore(task);
  const score = is_full_solution ? highestPossibleScore : 0;
  callback(null, {
    feedback, score, is_solution, is_full_solution
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
