
import runTask from 'alkindi-task-lib';

import Task from './intro';
import {Workspace} from './views';
import {isLegalLetter, isLegalBigram, findOccurrence, analyze} from './utils';
import {NUM_SYMBOLS, NUM_BIGRAMS_SEARCH} from './constants';

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
  bundle.defineView('Workspace', WorkspaceSelector, Workspace(deps));
  function WorkspaceSelector (state, props) {
    const {score, task, workspace, hintRequest, submitAnswer} = state;
    return {score, task, workspace, hintRequest, submitAnswer: submitAnswer || {}};
  }

  /*** End of required task definitions ***/

  /* These are passed to WorkspaceView. */
  bundle.use('showHintRequest', 'requestHint', 'submitAnswer', 'SaveButton', 'dismissAnswerFeedback');

  /* taskInitialized is called to update the global state when the task is first loaded. */
  function taskLoaded (state) {
    const {cipherText} = state.task;
    const substitution = [];
    for(let index = 0; index < NUM_SYMBOLS; index++) {
      substitution.push({
        letter: null
      });
    }
    const highlightBigrams = {
      arrays: {
        symbols: [],
        letters: []
      },
      counts: {
        symbols: {},
        letters: {}
      }
    };
    for(let index = 0; index < NUM_BIGRAMS_SEARCH; index++) {
      highlightBigrams.arrays.symbols.push("");
      highlightBigrams.arrays.letters.push("");
    }
    const highlightToggleState = {};
    const searchIndex = null;
    const searchBigrams = false;
    const analysis = analyze(cipherText);
    const workspace = {substitution, highlightToggleState, highlightBigrams, searchIndex, searchBigrams, analysis};
    return {...state, workspace};
  }

  /* taskUpdated is called to update the global state when the task is updated. */
  function taskUpdated (state) {
    const workspace = updateWorkspace(state.task, state.workspace);
    return {...state, workspace};
  }

  /* workspaceLoaded is called to update the global state when a workspace dump is loaded. */
  function workspaceLoaded (state, dump) {
    const {substitution, highlightToggleState, highlightBigrams, searchIndex, searchBigrams} = dump;
    const analysis = analyze(cipherText);
    const workspace = updateWorkspace(state.task, {substitution, highlightToggleState, highlightBigrams, analysis});
    return {...state, workspace};
  }

  /* dumpWorkspace is called to build a serializable workspace dump.
     It should return the smallest part of the workspace that is needed to
     rebuild it.  */
  function dumpWorkspace (state) {
    const {substitution, highlightToggleState, highlightBigrams, searchIndex, searchBigrams} = state.workspace;
    return {substitution, highlightToggleState, highlightBigrams, searchIndex, searchBigrams};
  }

  function isWorkspaceReady (state) {
    return ('workspace' in state) && ('substitution' in state.workspace);
  }

  /* changeSubstitution {index, letter} updates the user substitution accordingly. */
  bundle.defineAction('changeSubstitution', 'Workspace.ChangeSubstitution');
  bundle.addReducer('changeSubstitution', function substitutionChangeReducer (state, action) {
    let {index, letter} = action;
    if(letter !== null && letter !== undefined) {
      letter = letter.toUpperCase();
    }
    if(!isLegalLetter(letter)) {
      return state;
    }
    let {workspace} = state;
    let substitution = workspace.substitution.slice();
    substitution[index] = {letter};
    workspace = {...workspace, substitution};
    return {...state, workspace, isWorkspaceUnsaved: true};
  });
  
  /* toggleHighlight {index} updates the toggle state accordingly. */
  bundle.defineAction('toggleHighlight', 'Workspace.ToggleHighlight');
  bundle.addReducer('toggleHighlight', function highlightToggleChangeReducer (state, action) {
    const {index} = action;
    let {workspace} = state;
    let {highlightToggleState} = workspace;
    highlightToggleState = {...highlightToggleState};
    if(highlightToggleState[index]) {
      delete highlightToggleState[index];
    }
    else {
      highlightToggleState[index] = true;
    }
    workspace = {...workspace, highlightToggleState};
    return {...state, workspace, isWorkspaceUnsaved: true};
  });

  /* changeBigramHighlight {index, charType, value} updates the bigram state accordingly. */
  bundle.defineAction('changeBigramHighlight', 'Workspace.ChangeBigramHighlight');
  bundle.addReducer('changeBigramHighlight', function bigramHighlightChangeReducer (state, action) {
    const {index, charType} = action;
    let {value} = action;
    value = value.toUpperCase();
    if(!isLegalBigram(value, charType, true)) {
      return state;
    }
    let {workspace} = state;
    let {highlightBigrams} = workspace;
    highlightBigrams = {...highlightBigrams};
    let {arrays, counts} = highlightBigrams;
    arrays = {...arrays};
    counts = {...counts};
    highlightBigrams = {...highlightBigrams, arrays, counts};
    arrays[charType] = arrays[charType].slice();
    counts[charType] = {...counts[charType]};

    const oldValue = arrays[charType][index];
    arrays[charType][index] = value;

    if(counts[charType][oldValue] > 0) {
      counts[charType][oldValue]--;
      if(counts[charType][oldValue] === 0) {
        delete counts[charType][oldValue];
      }
    }
    if(isLegalBigram(value, charType)) {
      if(counts[charType][value] > 0) {
        counts[charType][value]++;
      }
      else {
        counts[charType][value] = 1;
      }
    }
    workspace = {...workspace, highlightBigrams};
    return {...state, workspace, isWorkspaceUnsaved: true};
  });

  /* search {forward, bigrams} finds the next or previous match. */
  bundle.defineAction('onSearch', 'Workspace.OnSearch');
  bundle.addReducer('onSearch', function searchChangeReducer (state, action) {
    const {forward, bigrams} = action;
    let {workspace} = state;
    const {task} = state;
    const {cipherText} = task;
    const {highlightToggleState, substitution, highlightBigrams} = workspace;
    let {searchIndex} = workspace;
    
    const searchBigrams = bigrams;
    let direction = 1;
    let startIndex;
    if(!forward) {
      direction = -1;
    }

    if(searchIndex === null) {
      startIndex = 0;
      if(!forward) {
        startIndex = cipherText.length - 1;
      }
    }
    else {
      startIndex = (searchIndex + direction + cipherText.length) % cipherText.length;
    }
    
    let keys = highlightToggleState;
    if(searchBigrams) {
      keys = {...highlightBigrams.counts.letters, ...highlightBigrams.counts.symbols};
    }
    searchIndex = findOccurrence(cipherText, substitution, startIndex, direction, keys, searchBigrams);
    workspace = {...workspace, searchIndex, searchBigrams};
    return {...state, workspace, isWorkspaceUnsaved: true};
  });
}
