
import update from 'immutability-helper';
import algoreaReactTask from './algorea_react_task';
import {updateWorkspace, makeDump, initWorkspace} from './utils';

import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import './style.css';
import './platform.css';
import 'rc-tooltip/assets/bootstrap.css';

import WorkspaceBundle from './workspace_bundle';
import AnalysisBundle from './views/analysis_bundle';
import cipherTextBundle from './views/cipherText_bundle';
import HighlightSearchBundle from './views/highlight_bundle';
import SubstitutionBundle from './views/substitution_bundle';


const TaskBundle = {
  actionReducers: {
    appInit: appInitReducer,
    taskInit: taskInitReducer /* possibly move to algorea-react-task */,
    taskRefresh: taskRefreshReducer /* possibly move to algorea-react-task */,
    taskAnswerLoaded: taskAnswerLoaded,
    taskStateLoaded: taskStateLoaded,
  },
  includes: [
    AnalysisBundle,
    cipherTextBundle,
    HighlightSearchBundle,
    SubstitutionBundle,
    WorkspaceBundle,
  ],
  selectors: {
    getTaskState,
    getTaskAnswer,
  }
};

if (process.env.NODE_ENV === 'development') {
  /* eslint-disable no-console */
  TaskBundle.earlyReducer = function (state, action) {
    console.log('ACTION', action.type, action);
    return state;
  };
}

function appInitReducer (state, _action) {
  const taskMetaData = {
    "id": "http://concours-alkindi.fr/tasks/2018/enigma",
    "language": "fr",
    "version": "fr.01",
    "authors": "Sébastien Carlier",
    "translators": [],
    "license": "",
    "taskPathPrefix": "",
    "modulesPathPrefix": "",
    "browserSupport": [],
    "fullFeedback": true,
    "acceptedAnswers": [],
    "usesRandomSeed": true
  };
  return {...state, taskMetaData};
}

function taskInitReducer (state, _action) {
  const dump = makeDump(state.taskData);
  return initWorkspace(state, dump);
}

function taskRefreshReducer (state, _action) {
  const dump = state.dump;
  return initWorkspace(state, dump);
}

function getTaskAnswer (state) {
  const symbolAttrs = state.dump.symbolAttrs;
  const clearText = state.workspace.combinedText.map(c => c.letter || '_').join('');
  return {
    symbolAttrs,
    clearText
  };
}

function taskAnswerLoaded (state, {payload: {symbolAttrs}}) {
  return updateWorkspace(update(state, {dump: {symbolAttrs: {$set: symbolAttrs}}}));
}

function getTaskState (state) {
  return state.dump || {};
}

function taskStateLoaded (state, {payload: {dump}}) {
  return updateWorkspace(state, dump);
}

export function run (container, options) {
  return algoreaReactTask(container, options, TaskBundle);
}
