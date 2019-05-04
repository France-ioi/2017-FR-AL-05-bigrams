
import React from 'react';
import {connect} from 'react-redux';
import update from 'immutability-helper';
import {takeLatest, select} from 'redux-saga/effects';
import {Button} from 'react-bootstrap';
import classnames from 'classnames';
import {letterToDisplayString, symbolToDisplayString, updateWorkspace} from '../utils';
import {NUM_BIGRAMS_SEARCH, SYMBOL_DIGITS, COLOR_PALETTE, getBackgroundColor} from '../constants';

class ColorPickerItem extends React.PureComponent {
  onClick = () => {
    this.props.onClick(this.props.index);
  }

  render () {
    const {hue, selected} = this.props;
    const classes = ['color', selected && 'selected'];
    return (
      <span className={classnames(classes)}
        style={{backgroundColor: hue[2]}} onClick={this.onClick} />);
  }
}

class HighlightTogglePair extends React.PureComponent {
  onClick = () => {
    const {index, highlight} = this.props;
    this.props.onClick(index, highlight);
  }

  render () {
    const {symbol, letter, highlight, isHint} = this.props;
    const classes = ["highlightCharPair", "charPair"];
    const color = getBackgroundColor(highlight, isHint, false);
    return (
      <div className={classnames(classes)} onClick={this.onClick} style={{backgroundColor: color}}>
        <div className="highlightSymbol pairTop">
          {symbol}
        </div>
        <div className="highlightLetter pairBottom">
          {letter}
        </div>
      </div>
    );
  }
}
export class BigramInput extends React.PureComponent {
  constructor () {
    super();
    this.input1 = null;
    this.input2 = null;
  }

  onKeyPress = (event) => {
    const {cellSize} = this.props;
    if (event.target === this.input1 && this.input1.value.length === cellSize - 1) {
      this.input2.setSelectionRange(0, cellSize);
      this.input2.focus();
    }
  }

  onKeyDown = (event) => {
    const {cellSize} = this.props;
    if (event.target === this.input1) {
      if (event.keyCode === 39 && this.input1.selectionStart === cellSize) {
        this.input2.setSelectionRange(0, 0);
        this.input2.focus();
      }
    } else if (event.target === this.input2) {
      if (event.keyCode === 8 && this.input2.selectionStart === 0) {
        this.input1.setSelectionRange(cellSize, cellSize);
        this.input1.focus();
      } else if (event.keyCode === 37 && this.input2.selectionStart === 0) {
        this.input1.setSelectionRange(cellSize, cellSize);
        this.input1.focus();
      }
    }
  }

  onChange = () => {
    const value = this.input1.value + this.input2.value;
    this.props.onChange(value);
  }

  refInput1 = (element) => {
    this.input1 = element;
  }

  refInput2 = (element) => {
    this.input2 = element;
  }

  state = {selectionStart: 0, selectionEnd: 0};

  render () {
    const {value, cellSize, className} = this.props;
    const value1 = value.substr(0, cellSize);
    const value2 = value.substr(cellSize, cellSize);
    return (
      <div className={className}>
        <input type="text" ref={this.refInput1} onKeyDown={this.onKeyDown} onKeyPress={this.onKeyPress} maxLength={cellSize} value={value1} onChange={this.onChange} />
        <input type="text" ref={this.refInput2} onKeyDown={this.onKeyDown} maxLength={cellSize} value={value2} onChange={this.onChange} />
      </div>
    );
  }
}

export class HighlightBigramSymbol extends React.PureComponent {
  onChange = (value) => {
    this.props.onChange(this.props.index, value);
  }
  render () {
    const {value} = this.props;
    return <BigramInput className="highlightBigramSymbolDiv"
      cellSize={SYMBOL_DIGITS} onChange={this.onChange} value={value} />;
  }
}

export class HighlightBigramLetter extends React.PureComponent {
  onChange = (value) => {
    this.props.onChange(this.props.index, value);
  }
  render () {
    const {value} = this.props;
    return <BigramInput className="highlightBigramLetterDiv"
      cellSize={1} onChange={this.onChange} value={value} />;
  }
}

export class Search extends React.PureComponent {
  onClickPrevious = () => {
    const {bigrams} = this.props;
    this.props.onClick(false, bigrams);
  }

  onClickNext = () => {
    const {bigrams} = this.props;
    this.props.onClick(true, bigrams);
  }

  onChangeFilter = (event) => {
    const value = event.target.checked;
    return this.props.onChangeFilter(value);
  }

  render () {
    const {filter} = this.props;
    return (
      <div>
        <div className="searchDiv">
          Rechercher :&nbsp;
          <Button onClick={this.onClickPrevious}>&lt;</Button>
          <Button onClick={this.onClickNext}>&gt;</Button>
        </div>
        <div className="applyFiltersDiv">
          <label><input type="checkbox" value={filter} onChange={this.onChangeFilter} />Filtrer dans l'analyse</label>
        </div>
      </div>
    );
  }
}

export class HighlightAndSearch extends React.PureComponent {

  onChangeFilterSymbols = (value) => {
    this.onChangeFilter('symbols', value);
  }

  onChangeFilterBigrams = (value) => {
    this.onChangeFilter('bigrams', value);
  }

  onChangeSymbolHighlight = (index, current) => {
    const {selectedColorIndex} = this.props;
    const highlight = selectedColorIndex === current ? false : selectedColorIndex;
    this.props.dispatch({type: this.props.changeSymbolHighlight, symbol: index, highlight});
  }

  onBigramSymbolChange = (index, value) => {
    value = value.replace(/[^0-9]+/, '');
    this.props.dispatch({type: this.props.changeBigramHighlightSymbols, index, value});
  }

  onBigramLetterChange = (index, value) => {
    value = value.toUpperCase().replace(/[^A-Z]+/, '');
    this.props.dispatch({type: this.props.changeBigramHighlightLetters, index, value});
  }

  onClearAllHighlight = () => {
    this.props.dispatch({type: this.props.clearAllHighlight});
  }

  onClickSearch = (forward, bigrams) => {
    this.props.dispatch({type: this.props.onSearch, forward, bigrams});
  }

  onChangeFilter = (kind, value) => {
    this.props.dispatch({type: this.props.filterChanged, kind, value});
  }

  onColorPicked = (index) => {
    this.props.dispatch({type: this.props.colorPicked, index});
  }

  onChangeMode = (event) => {
    this.props.dispatch({type: this.props.analysisModeChanged, value: event.target.value});
  }

  render () {
    const {
      filters,
      substitution,
      highlightedBigramSymbols,
      highlightedBigramLetters,
      selectedColorIndex
    } = this.props;

    return (
      <div className="panel panel-default highlightView">
        <div className="panel-heading toolHeader">
          recherche et filtrage
        </div>
        <div className="panel-body">
          <div className="symbolHighlightSearch">
            <p className="toolDescription">{"Cliquez sur une couleur puis des nombres pour colorer toutes leurs occurrences dans le texte et l'analyse :"}</p>
            <div className="higlightPalette">
              {COLOR_PALETTE.map((hue, index) =>
                <ColorPickerItem key={index} index={index} hue={hue} selected={selectedColorIndex == index} onClick={this.onColorPicked} />)}
              <Button onClick={this.onClearAllHighlight}>Tout déselectionner</Button>
            </div>
            <div className="toolBox">
              <div className="highlightToggleBox">
                {substitution.map((target, index) => {
                  const symbol = symbolToDisplayString(index);
                  const letter = letterToDisplayString(target.letter);
                  return <HighlightTogglePair key={index}
                    index={index} symbol={symbol} letter={letter}
                    isHint={target.isHint} highlight={target.highlight}
                    onClick={this.onChangeSymbolHighlight} />;
                })}
              </div>
              <Search onClick={this.onClickSearch} bigrams={false} filter={filters.symbols} onChangeFilter={this.onChangeFilterSymbols} />
            </div>
          </div>
          <div className="bigramsHighlightSearch">
            <p className="toolDescription">Entrez jusqu'à {NUM_BIGRAMS_SEARCH} paires de nombres ou de lettres pour colorer leurs occurrences :</p>
            <div className="toolBox">
              <div className="highlightBigramsBox">
                <span className="toolLabel">Paires de nombres :</span>
                {highlightedBigramSymbols.map((value, index) => {
                  return <HighlightBigramSymbol key={index} index={index} value={value} onChange={this.onBigramSymbolChange} />;
                })}
                <span className="toolLabel">Paires de lettres :</span>
                {highlightedBigramLetters.map((value, index) => {
                  return <HighlightBigramLetter key={index} index={index} value={value} onChange={this.onBigramLetterChange} />;
                })}
              </div>
              <Search onClick={this.onClickSearch} bigrams={true} filter={filters.bigrams} onChangeFilter={this.onChangeFilterBigrams} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function HighlightAndSearchSelector (state) {
  const {dump, workspace, selectedColorIndex} = state;
  const {highlightedBigramSymbols, highlightedBigramLetters, filters} = dump;
  const {substitution} = workspace;
  const {changeSymbolHighlight, changeBigramHighlightSymbols, changeBigramHighlightLetters, clearAllHighlight, onSearch, filterChanged, colorPicked, analysisModeChanged} = state.actions;

  return {
    filters,
    substitution,
    highlightedBigramSymbols,
    highlightedBigramLetters,
    selectedColorIndex,
    changeSymbolHighlight,
    changeBigramHighlightSymbols,
    changeBigramHighlightLetters,
    clearAllHighlight,
    onSearch,
    filterChanged,
    colorPicked,
    analysisModeChanged
  }
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

function colorPickedReducer (state, action) {
  const {index} = action;
  return {...state, selectedColorIndex: index};
}

/* The 'init' action sets the workspace operations in the global state. */
function initReducer (state, _action) {
	return {...state, selectedColorIndex: 0};
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
    changeSymbolHighlight: 'Workspace.ChangeSymbolHighlight',
    changeBigramHighlightSymbols: 'Workspace.ChangeBigramHighlight.Symbols',
    changeBigramHighlightLetters: 'Workspace.ChangeBigramHighlight.Letters',
    clearAllHighlight: 'Workspace.ClearAllHighlight',
    onSearch: 'Workspace.OnSearch',
    filterChanged: 'Workspace.Filter.Changed',
    colorPicked: 'Workspace.Color.Picked',
  },
  actionReducers: {
    taskInit: initReducer,
    changeSymbolHighlight: changeSymbolHighlightReducer,
    changeBigramHighlightSymbols: changeBigramHighlightSymbolsReducer,
    changeBigramHighlightLetters: changeBigramHighlightLettersReducer,
    clearAllHighlight: clearAllHighlightReducer,
    onSearch: onSearchReducer,
    filterChanged: filterChangedReducer,
    colorPicked: colorPickedReducer,
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
    HighlightAndSearch: connect(HighlightAndSearchSelector)(HighlightAndSearch),
  }
};