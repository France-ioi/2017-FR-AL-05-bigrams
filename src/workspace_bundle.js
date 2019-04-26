import React from '../node_modules/react/react';
import {connect} from '../node_modules/react-redux/lib';
import update from '../node_modules/immutability-helper';
import {takeLatest, select} from '../node_modules/redux-saga/effects';
import {
	updateWorkspace,
	isValidLetter,
} from './utils';
import Workspace from './views';


/* The 'Workspace' view displays the main task view to the contestant. */
function WorkspaceSelector (state, props) {
	const {
		requestHint, showHintRequest, changeSubstitution, lockSymbol, changeSymbolHighlight, changeBigramHighlightSymbols,
		changeBigramHighlightLetters, clearAllHighlight,
		onSearch, filterChanged, analysisModeChanged, repeatedBigramsFilterChanged,
		setTextBoxInterface, colorPicked
	} = state.actions;

	const actions = {
		requestHint, showHintRequest, changeSubstitution, lockSymbol, changeSymbolHighlight, changeBigramHighlightSymbols,
		changeBigramHighlightLetters, clearAllHighlight,
		onSearch, filterChanged, analysisModeChanged, repeatedBigramsFilterChanged,
		setTextBoxInterface, colorPicked
	};

	const {score, taskData: task, dump, workspace, hintRequestData, selectedColorIndex} = state;
	return {score, task, dump, workspace, hintRequestData, selectedColorIndex, actions};
}

/* The 'init' action sets the workspace operations in the global state. */
function initReducer (state, _action) {
	return {...state, selectedColorIndex: 0};
}

/* changeSubstitution {index, letter} updates the user substitution accordingly. */
function changeSubstitutionReducer (state, action) {
	let {index, letter} = action;
	if (letter === '' || isValidLetter(letter)) {
		const dump = update(state.dump, {
			symbolAttrs: {[index]: {letter: {$set: letter}}}
		});
		return updateWorkspace(state, dump);
	}
	return state;
}

function lockSymbolReducer (state, action) {
	let {index, value} = action;
	const dump = update(state.dump, {
		symbolAttrs: {[index]: {isLocked: {$set: value}}}
	});
	return updateWorkspace(state, dump);
}

/* setHighlightHue {index} sets the highlight color (or false to clear) */
function changeSymbolHighlightReducer (state, action) {
	const {symbol, highlight} = action;
	const dump = update(state.dump, {
		symbolAttrs: {[symbol]: {highlight: {$set: highlight}}}
	});
	return updateWorkspace(state, dump);
}

/* changeBigramHighlightSymbols {index, value} changes the symbols
   (format "nnnn") for the bigram-highlight slot at the given index. */
function changeBigramHighlightSymbolsReducer (state, action) {
	const {index, value} = action;
	const dump = update(state.dump, {
		highlightedBigramSymbols: {
			[index]: {$set: value}
		}
	});
	return updateWorkspace(state, dump);
}

/* changeBigramHighlightLetters {index, value} changes the letters
   (format "AA") for the bigram-highlight slot at the given index. */
function changeBigramHighlightLettersReducer (state, action) {
	const {index, value} = action;
	const dump = update(state.dump, {
		highlightedBigramLetters: {
			[index]: {$set: value}
		}
	});
	return updateWorkspace(state, dump);
}

function clearAllHighlightReducer (state, _action) {
	const {dump} = state;
	const symbolAttrs = {...dump.symbolAttrs};
	Object.keys(symbolAttrs).forEach(function (symbol) {
		const attrs = symbolAttrs[symbol];
		if (typeof attrs.highlight === 'number') {
			symbolAttrs[symbol] = {...attrs, highlight: false};
		}
	});
	return updateWorkspace(state, {...dump, symbolAttrs});
}

/* search {forward, bigrams} finds the next or previous match. */
function onSearchReducer (state, action) {
	const {forward, bigrams} = action;
	const searchCursor = moveSearchCursor(state, forward, bigrams);
	const dump = update(state.dump, {searchCursor: {$set: searchCursor}});
	return updateWorkspace(state, dump);
}

function filterChangedReducer (state, action) {
	const {kind, value} = action;
	const dump = update(state.dump, {filters: {[kind]: {$set: value}}});
	return updateWorkspace(state, dump);
}

function repeatedBigramsFilterChangedReducer (state, action) {
	const {value} = action;
	const dump = update(state.dump, {repeatedBigrams: {$set: value}});
	return updateWorkspace(state, dump);
}

function analysisModeChangedReducer (state, action) {
	const {value} = action;
	const dump = update(state.dump, {analysisMode: {$set: value}});
	return updateWorkspace(state, dump);
}

function setTextBoxInterfaceReducer (state, action) {
	return {...state, textBoxInterface: action.intf};
}

function colorPickedReducer (state, action) {
	const {index} = action;
	return {...state, selectedColorIndex: index};
}

function showHintRequestReducer (state, action) {
	const {request} = action;
	return {...state, hintRequestData: request};
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


export default {
	actions: {
		changeSubstitution: 'Workspace.ChangeSubstitution',
		lockSymbol: 'Workspace.LockSymbol',
		changeSymbolHighlight: 'Workspace.ChangeSymbolHighlight',
		changeBigramHighlightSymbols: 'Workspace.ChangeBigramHighlight.Symbols',
		changeBigramHighlightLetters: 'Workspace.ChangeBigramHighlight.Letters',
		clearAllHighlight: 'Workspace.ClearAllHighlight',
		onSearch: 'Workspace.OnSearch',
		filterChanged: 'Workspace.Filter.Changed',
		repeatedBigramsFilterChanged: 'Workspace.RepeatedBigramsFilter.Changed',
		analysisModeChanged: 'Workspace.AnalysisMode.Changed',
		setTextBoxInterface: 'Workspace.TextBox.SetInterface',
		colorPicked: 'Workspace.Color.Picked',
		showHintRequest: 'Hint.ShowRequest',
	},
	actionReducers: {
		taskInit: initReducer,
		changeSubstitution: changeSubstitutionReducer,
		lockSymbol: lockSymbolReducer,
		changeSymbolHighlight: changeSymbolHighlightReducer,
		changeBigramHighlightSymbols: changeBigramHighlightSymbolsReducer,
		changeBigramHighlightLetters: changeBigramHighlightLettersReducer,
		clearAllHighlight: clearAllHighlightReducer,
		onSearch: onSearchReducer,
		filterChanged: filterChangedReducer,
		repeatedBigramsFilterChanged: repeatedBigramsFilterChangedReducer,
		analysisModeChanged: analysisModeChangedReducer,
		setTextBoxInterface: setTextBoxInterfaceReducer,
		colorPicked: colorPickedReducer,
		showHintRequest: showHintRequestReducer,
	},
	saga: function* () {
		/* After every onSearch action is reduced, scroll the text box to show
		the first selected character. */
		const actions = yield select(({actions: {onSearch}}) => ({onSearch}));
		yield takeLatest(actions.onSearch, function* (_action) {
			const textBoxInterface = yield select(state => state.textBoxInterface);
			const index = yield select(state => state.dump.searchCursor.first);
			if (textBoxInterface && index >= 0) {
				textBoxInterface.scrollToPosition(index);
			}
		});
	},
	views: {
		Workspace: connect(WorkspaceSelector)(Workspace),
	}
};