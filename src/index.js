
import runTask from 'alkindi-task-lib';
import update from 'immutability-helper';
import {takeLatest, select} from 'redux-saga/effects';

import Task from './intro';
import {Workspace} from './views';
import {symbolToDisplayString, isValidLetter, isValidSymbolPair, isValidLetterPair, analyze, letterToDisplayString, symbolsToDisplayLetters} from './utils';
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
    return {...state, workspaceOperations, selectedColorIndex: 0};
  });

  /* The 'Task' view displays the task introduction to the contestant. */
  bundle.defineView('Task', TaskSelector, Task);
  function TaskSelector (state) {
    const {task, taskBaseUrl} = state;
    return {version: task.version, baseUrl: taskBaseUrl};
  }

  /* The 'Workspace' view displays the main task view to the contestant. */
  const WorkspaceActions = bundle.pack(
    'showHintRequest', 'requestHint', 'submitAnswer', 'SaveButton', 'dismissAnswerFeedback',
    'changeSubstitution', 'lockSymbol', 'changeSymbolHighlight', 'changeBigramHighlightSymbols', 'changeBigramHighlightLetters',
    'onSearch', 'filterChanged', 'analysisModeChanged', 'repeatedBigramsFilterChanged',
    'setTextBoxInterface', 'colorPicked');
  function WorkspaceSelector (state, props) {
    const {score, task, dump, workspace, hintRequest, submitAnswer, selectedColorIndex} = state;
    return {score, task, dump, workspace, hintRequest, submitAnswer: submitAnswer || {}, selectedColorIndex};
  }
  bundle.defineView('Workspace', WorkspaceSelector, Workspace(WorkspaceActions));

  /*** End of required task definitions ***/

  function taskLoaded (state) {
    const dump = makeDump(state.task);
    return initWorkspace(state, dump);
  }

  function taskUpdated (state) {
    const dump = reconcileDump(state.task, state.dump);
    return initWorkspace(state, dump);
  }

  function workspaceLoaded (state, dump) {
    return updateWorkspace(state, dump);
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
      return updateWorkspace(state, dump);
    }
    return state;
  });

  bundle.defineAction('lockSymbol', 'Workspace.LockSymbol');
  bundle.addReducer('lockSymbol', function (state, action) {
    let {index, value} = action;
    const dump = update(state.dump, {
      symbolAttrs: {[index]: {isLocked: {$set: value}}}});
    return updateWorkspace(state, dump);
  });

  /* setHighlightHue {index} sets the highlight color (or false to clear) */
  bundle.defineAction('changeSymbolHighlight', 'Workspace.ChangeSymbolHighlight');
  bundle.addReducer('changeSymbolHighlight', function (state, action) {
    const {symbol, highlight} = action;
    const dump = update(state.dump, {
      symbolAttrs: {[symbol]: {highlight: {$set: highlight}}}});
    return updateWorkspace(state, dump);
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
    return updateWorkspace(state, dump);
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
    return updateWorkspace(state, dump);
  });

  /* search {forward, bigrams} finds the next or previous match. */
  bundle.defineAction('onSearch', 'Workspace.OnSearch');
  bundle.addReducer('onSearch', function searchChangeReducer (state, action) {
    const {forward, bigrams} = action;
    const searchCursor = moveSearchCursor(state, forward, bigrams);
    const dump = update(state.dump, {searchCursor: {$set: searchCursor}});
    return updateWorkspace(state, dump);
  });
  bundle.addSaga(function* () {
    /* After every onSearch action is reduced, scroll the text box to show
       the first selected character. */
    yield takeLatest(deps.onSearch, function* (action) {
      const textBoxInterface = yield select(state => state.textBoxInterface);
      const index = yield select(state => state.dump.searchCursor.first);
      if (textBoxInterface && index >= 0) {
        textBoxInterface.scrollToPosition(index);
      }
    });
  });

  bundle.defineAction('filterChanged', 'Workspace.Filter.Changed');
  bundle.addReducer('filterChanged', function (state, action) {
    const {kind, value} = action;
    const dump = update(state.dump, {filters: {[kind]: {$set: value}}});
    return updateWorkspace(state, dump);
  });

  bundle.defineAction('repeatedBigramsFilterChanged', 'Workspace.RepeatedBigramsFilter.Changed');
  bundle.addReducer('repeatedBigramsFilterChanged', function (state, action) {
    const {value} = action;
    const dump = update(state.dump, {repeatedBigrams: {$set: value}});
    return updateWorkspace(state, dump);
  });

  bundle.defineAction('analysisModeChanged', 'Workspace.AnalysisMode.Changed');
  bundle.addReducer('analysisModeChanged', function (state, action) {
    const {value} = action;
    const dump = update(state.dump, {analysisMode: {$set: value}});
    return updateWorkspace(state, dump);
  });

  bundle.defineAction('setTextBoxInterface', 'Workspace.TextBox.SetInterface');
  bundle.addReducer('setTextBoxInterface', function (state, action) {
    return {...state, textBoxInterface: action.intf};
  });

  bundle.defineAction('colorPicked', 'Workspace.Color.Picked');
  bundle.addReducer('colorPicked', function (state, action) {
    const {index} = action;
    return {...state, selectedColorIndex: index};
  });

}

/* Build an initial dump when the task is loaded. */
function makeDump (task) {
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

function reconcileDump (task, dump) {
  return dump;
}

function dumpWorkspace (state) {
  return state.dump;
}

/* Return a state with the workspace initialized for the given dump. */
function initWorkspace (state, dump) {
  const analysis = analyze(state.task.cipherText);
  return updateWorkspace({...state, analysis}, dump);
}

/* Update the state by rebuilding a workspace for the given dump. */
function updateWorkspace (state, dump) {
  const {task} = state;
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
  const maxAnalysisResults = 20;
  analysis = analysis.slice(0, maxAnalysisResults);

  const workspace = {numSymbols, combinedText, substitution, analysis, ready: true};
  return {...state, dump, workspace};
}

function moveSearchCursor (state, forward, bigrams) {
  const {combinedText} = state.workspace;
  const step = forward ? 1 : -1;
  const first = Math.min(Math.max(state.dump.searchCursor.first, 0), combinedText.length - 1);
  let iCell = first, cell, looped = false;
  do {
    iCell += step;
    if (iCell === -1) {
      iCell = combinedText.length - 1;
    } else if (iCell === combinedText.length) {
      iCell = 0;
    }
    if (iCell === first) {
      looped = true;
    }
    cell = combinedText[iCell];
    if (bigrams) {
      if (cell.hlBigramFirst) {
        return {first: iCell, last: iCell + 1};
      }
    } else {
      if (cell.hlSymbol) {
        return {first: iCell, last: iCell};
      }
    }
  } while (!looped);
  return {first, last: first - 1};
}
