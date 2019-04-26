// var {generate} = require("../bebras-modules/pemFioi/sentences_2");
var generate = require("./generate");

/**
 * Default constants
 */

/**
 * task module export...
 */

/* prefer JSON config file at project root?  depend on NODE_ENV? */
module.exports.config = {
  cache_task_data: false
};

module.exports.taskData = function (args, callback) {
  const version = parseInt(args.task.params.version);
  // hints array
  const hintsRequested = getHintsRequested(args.task.hints_requested);
  const {publicData} = generateTaskData(args.task.random_seed, hintsRequested, version);
  callback(null, publicData);
};

module.exports.requestHint = function (args, callback) {
  const request = args.request;
  const hints_requested = args.task.hints_requested
    ? JSON.parse(args.task.hints_requested)
    : [];
  for (var hintRequest of hints_requested) {
    if (hintRequest === null) {
      /* XXX Happens, should not. */
      /* eslint-disable-next-line no-console */
      console.log("XXX", args.task.hints_requested);
      continue;
    }
    if (typeof hintRequest === "string") {
      hintRequest = JSON.parse(hintRequest);
    }
    if (hintRequestEqual(hintRequest, request)) {
      return callback(new Error("hint already requested"));
    }
  }
  callback(null, args.request);
};

module.exports.gradeAnswer = function (args, task_data, callback) {
  try {

    const version = parseInt(args.task.params.version);

    // hints array
    const hintsRequested = getHintsRequested(args.answer.hints_requested);

    const {
      publicData,
      privateData: {
        clearText
      }
    } = generateTaskData(args.task.random_seed, hintsRequested, version);

    const sumbittedText = JSON.parse(args.answer.value).clearText;
    console.log('sumbittedText :', sumbittedText.substring(0,10));
    console.log('clearText :', clearText.substring(0,10));
    const wrongMap = new Map();
    for (let iChar = 0; iChar < clearText.length; iChar += 1) {
      const correctCode = clearText.charCodeAt(iChar);
      const submittedCode = sumbittedText.charCodeAt(iChar);
      if (correctCode !== submittedCode && !wrongMap.has(correctCode)) {
        wrongMap.set(correctCode, submittedCode);
      }
    }
    const nErrors = wrongMap.size;
    const is_solution = nErrors <= 4;
    const feedback = is_solution ? nErrors : false;
    const highestPossibleScore = getHighestPossibleScore(publicData);
    let score = is_solution ? highestPossibleScore * (1 - 0.25 * nErrors) : 0;
    score = score < 0 ? 0 : score;

    let message = "";
    if (feedback === 0) {
      message = " Votre réponse est exacte.";
    } else if (feedback > 0) {
      message = ` Votre réponse a ${feedback} erreur${feedback === 1 ? '' : 's'}.`;
    } else if (feedback === false) {
      message = " Votre réponse est incorrecte.";
    }
    callback(null, {
      score,
      message,
    });

  } catch (error) {
    callback(error, null);
  }

};

/**
 * task methods
 */
function getHintsRequested (hints_requested) {
  return (hints_requested
    ? JSON.parse(hints_requested)
    : []
  ).filter(hr => hr !== null);
}

function generateTaskData (random_seed, hintsRequested, version) {
  const [publicData, privateData] = generate(version, random_seed);
  const {decipherSubst} = privateData;
  const hints = grantHints(decipherSubst, hintsRequested);
  publicData.hints = hints;
  publicData.highestPossibleScore = getHighestPossibleScore(publicData);
  console.log('decipherSubst :', decipherSubst.join(', '));
  return {publicData, privateData};
}

function hintRequestEqual (h1, h2) {
  return (
    h1.index === h2.index
  );
}

function getHighestPossibleScore (task) {
  const {hints, baseScore, hintCost} = task;
  const hintsGranted = hints.filter(x => x !== null).length;
  return Math.max(0, baseScore - (hintsGranted * hintCost));
}

function grantHints (decipherSubst, hintRequests) {
  const hints = new Array(decipherSubst.length).fill(null);
  hintRequests.forEach(request => {
    hints[request.index] = decipherSubst[request.index];
  });
  return hints;
}
