
import runTask from 'alkindi-task-lib';
import update from 'immutability-helper';

import Task from './intro';
import {Workspace} from './views';
import {symbolToDisplayString, isValidLetter, isValidSymbolPair, isValidLetterPair, analyze, letterToDisplayString} from './utils';
import {NUM_BIGRAMS_SEARCH} from './constants';

import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'rc-tooltip/assets/bootstrap.css';
import './style.css';

export function run (container, options) {
  runTask(container, options, TaskBundle);
};

function TaskBundle (bundle, deps) {

  /*** Start of required task definitions ***/

  const workspaceOperations = {
    taskLoaded,
    taskUpdated,
    workspaceLoaded,
    dumpWorkspace,
    isWorkspaceReady
  };

  /* The 'init' action sets the workspace operations in the global state. */
  bundle.addReducer('init', function (state, action) {
    return {...state, workspaceOperations};
  });

  /* The 'Task' view displays the task introduction to the contestant. */
  bundle.defineView('Task', TaskSelector, Task);
  function TaskSelector (state) {
    const {task} = state;
    return {task};
  }

  /* The 'Workspace' view displays the main task view to the contestant. */
  const WorkspaceActions = bundle.pack(
    'showHintRequest', 'requestHint', 'submitAnswer', 'SaveButton', 'dismissAnswerFeedback',
    'changeSubstitution', 'toggleHighlight', 'changeBigramHighlightSymbols', 'changeBigramHighlightLetters',
    'onSearch', 'filterChanged');
  function WorkspaceSelector (state, props) {
    const {score, task, dump, workspace, hintRequest, submitAnswer} = state;
    return {score, task, dump, workspace, hintRequest, submitAnswer: submitAnswer || {}};
  }
  bundle.defineView('Workspace', WorkspaceSelector, Workspace(WorkspaceActions));

  /*** End of required task definitions ***/

  function taskLoaded (state) {
    const dump = makeDump(state.task);
    const workspace = makeWorkspace(state.task, dump);
    return {...state, dump, workspace};
  }

  function taskUpdated (state) {
    const dump = reconcileDump(state.task, state.dump);
    const workspace = makeWorkspace(state.task, dump);
    return {...state, dump, workspace};
  }

  function workspaceLoaded (state, dump) {
    const workspace = makeWorkspace(state.task, dump);
    return {...state, dump, workspace};
  }

  function isWorkspaceReady (state) {
    return state.workspace.ready;
  }

  /* changeSubstitution {index, letter} updates the user substitution accordingly. */
  bundle.defineAction('changeSubstitution', 'Workspace.ChangeSubstitution');
  bundle.addReducer('changeSubstitution', function substitutionChangeReducer (state, action) {
    let {index, letter} = action;
    if (letter === '' || isValidLetter(letter)) {
      const dump = update(state.dump, {
        symbolAttrs: {[index]: {letter: {$set: letter}}}});
      const workspace = makeWorkspace(state.task, dump);
      state = {...state, dump, workspace};
    }
    return state;
  });

  /* toggleHighlight {index} updates the toggle state accordingly. */
  bundle.defineAction('toggleHighlight', 'Workspace.ToggleHighlight');
  bundle.addReducer('toggleHighlight', function highlightToggleChangeReducer (state, action) {
    const {index} = action;
    const dump = update(state.dump, {
      symbolAttrs: {[index]: {highlight: {$apply: b => !b}}}});
    const workspace = makeWorkspace(state.task, dump);
    return {...state, dump, workspace};
  });

  /* changeBigramHighlightSymbols {index, value} changes the symbols
     (format "nnnn") for the bigram-highlight slot at the given index. */
  bundle.defineAction('changeBigramHighlightSymbols', 'Workspace.ChangeBigramHighlight.Symbols');
  bundle.addReducer('changeBigramHighlightSymbols', function bigramHighlightChangeReducer (state, action) {
    const {index, value} = action;
    const dump = update(state.dump, {
      highlightedBigramSymbols: {
        [index]: {$set: value}
      }
    });
    const workspace = makeWorkspace(state.task, dump);
    return {...state, dump, workspace};
  });

  /* changeBigramHighlightLetters {index, value} changes the letters
     (format "AA") for the bigram-highlight slot at the given index. */
  bundle.defineAction('changeBigramHighlightLetters', 'Workspace.ChangeBigramHighlight.Letters');
  bundle.addReducer('changeBigramHighlightLetters', function bigramHighlightChangeReducer (state, action) {
    const {index, value} = action;
    const dump = update(state.dump, {
      highlightedBigramLetters: {
        [index]: {$set: value}
      }
    });
    const workspace = makeWorkspace(state.task, dump);
    return {...state, dump, workspace};
  });

  /* search {forward, bigrams} finds the next or previous match. */
  bundle.defineAction('onSearch', 'Workspace.OnSearch');
  bundle.addReducer('onSearch', function searchChangeReducer (state, action) {
    const {forward, bigrams} = action;
    const searchCursor = moveSearchCursor(state, forward, bigrams);
    const dump = update(state.dump, {searchCursor: {$set: searchCursor}});
    const workspace = makeWorkspace(state.task, dump);
    return {...state, dump, workspace};
  });

  bundle.defineAction('filterChanged', 'Workspace.FilterChanged');
  bundle.addReducer('filterChanged', function (state, action) {
    const {kind, value} = action;
    const dump = update(state.dump, {filters: {[kind]: {$set: value}}});
    const workspace = makeWorkspace(state.task, dump);
    return {...state, dump, workspace};
  });

}

/* Build an initial dump when the task is loaded. */
function makeDump (task) {
  const numSymbols = task.hints.length;
  const symbolAttrs = new Array(numSymbols).fill({letter: ''});
  const highlightedBigramSymbols = new Array(NUM_BIGRAMS_SEARCH).fill(''); // ['0102', ...]
  const highlightedBigramLetters = new Array(NUM_BIGRAMS_SEARCH).fill(''); // ['EN', ...]
  const searchCursor = {first: -1, last: -1};
  const filters = {single: false, bigrams: false};
  return {symbolAttrs, highlightedBigramSymbols, highlightedBigramLetters, searchCursor, filters};
}

function reconcileDump (task, dump) {
  return dump;
}

function dumpWorkspace (state) {
  return state.dump;
}

/* Build the workspace (live data) based on the task and dump. */
function makeWorkspace (task, dump) {

  const {cipherText, hints} = task;
  const numSymbols = hints.length;

  /* Highlighting maps */
  const highlightedSymbols = new Map(); // symbols → true
  const highlightedLetters = new Map(); // letters → true

  /* Hints override user input in the substitution. */
  const {symbolAttrs} = dump; /* array symbol → {letter, highlight} */
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
    if (attrs.highlight) {
      target.isHighlighted = true;
      highlightedSymbols.set(symbolStr, true);
      if (letter !== null) {
        highlightedLetters.set(letter, true);
      }
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
    if (highlightedSymbols.has(symbolStr) || letter && highlightedLetters.has(letter)) {
      cell.hlSingle = true;
    }
    if (highlightedSymbols.has(bigramSymbols) || highlightedLetters.has(bigramLetters)) {
      lastCell.hlBigramFirst = true;
      cell.hlBigramSecond = true;
    }
    combinedText.push(cell);
    lastSymbol = symbol;
    lastLetter = letter;
    lastCell = cell;
  }

  /* Analysis -- TODO: save and reuse */
  const analysis = analyze(cipherText);

  return {numSymbols, combinedText, substitution, analysis, ready: true};
}

function moveSearchCursor (state, forward, bigrams) {
  const step = forward ? 1 : -1;
  const {first} = state.dump.searchCursor;
  const {combinedText} = state.workspace;
  let iCell = first + step, cell, looped = false;
  while (true) {
    if (iCell === -1) {
      iCell = combinedText.length - 1;
    } else if (iCell === combinedText.length) {
      iCell = 0;
    }
    cell = combinedText[iCell];
    if (bigrams) {
      if (cell.hlBigramFirst) {
        return {first: iCell, last: iCell + 1};
      }
    } else {
      if (cell.hlSingle) {
        return {first: iCell, last: iCell};
      }
    }
    iCell += step;
    if (looped) {
      break;
    }
    if (iCell === first) {
      looped = true;
    }
  }
  return {first, last: first - 1};
}
