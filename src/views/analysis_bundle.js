
import React from 'react';
import {connect} from 'react-redux';
import update from 'immutability-helper';
import {
  symbolToDisplayString, letterToDisplayString,
  symbolsToDisplayLetters, updateWorkspace
} from '../utils';

import {getBackgroundColor} from '../constants';

class AnalysisTriplet extends React.PureComponent {
  render () {
    const {symbols, letters, count} = this.props;
    return (
      <div className="analysisTriplet">
        <div className="analysisCharPair charPair">
          <div className="pairTop">{symbols}</div>
          <div className="pairBottom">{letters}</div>
        </div>
        {count}{"x"}
      </div>
    );
  }
}
class AnalysisSymbolTriplet extends React.PureComponent {
  render () {
    const {symbol, substitution, count} = this.props;
    const {letter, isHint, highlight} = substitution[symbol];
    const symbolStr = symbolToDisplayString(symbol);
    const letterStr = letterToDisplayString(letter);
    const color = getBackgroundColor(highlight, isHint, false);
    return (
      <div className="analysisTriplet" style={{backgroundColor: color}}>
        <div className="analysisCharPair charPair">
          <div className="pairTop">{symbolStr}</div>
          <div className="pairBottom">{letterStr}</div>
        </div>
        {count}{"x"}
      </div>
    );
  }
}

class AnalysisBox extends React.PureComponent {
  render () {
    const {array, substitution} = this.props;
    return (
      <div className="analysisSmallBox">
        {array.map((analysisObject, index) => {
          return <AnalysisSymbolTriplet key={index} symbol={analysisObject.symbol} count={analysisObject.count} substitution={substitution} />;
        })}
      </div>
    );
  }
}

class SymbolAnalysisRow extends React.PureComponent {
  render () {
    const {top, substitution, symbolString, symbolArray, count, before, after} = this.props;
    const displayLetters = symbolsToDisplayLetters(substitution, symbolArray);
    return (
      <div className="analysisBox-row" style={{position: 'absolute', top: `${top}px`}}>
        <div className="analysisBox-before">
          <AnalysisBox array={before} substitution={substitution} />
        </div>
        <div className="analysisBox-center">
          <AnalysisTriplet symbols={symbolString} letters={displayLetters} count={count} />
        </div>
        <div className="analysisBox-after">
          <AnalysisBox array={after} substitution={substitution} />
        </div>
      </div>
    );
  }
}

class Analysis extends React.PureComponent {

  constructor () {
    super();
    this.scrollBoxElement = null;
    this.rowHeight = 80;
    this.visibleRowCount = 5;
  }

  refScrollBox = (element) => {
    this.scrollBoxElement = element;
  }

  onScroll = () => {
    const firstVisibleRow = Math.trunc(this.scrollBoxElement.scrollTop / this.rowHeight);
    this.setState({firstVisibleRow});
  }

  onChangeAnalysisMode = (event) => {
    this.props.dispatch({type: this.props.analysisModeChanged, value: event.target.value});
  }

  onChangeRepeatedBigramsFilter = (event) => {
    this.props.dispatch({type: this.props.repeatedBigramsFilterChanged, value: event.target.checked});
  }

  state = {firstVisibleRow: 0};

  render () {
    const {substitution, analysis, selectedMode, repeatedBigrams} = this.props;
    const {firstVisibleRow} = this.state;
    const visibleRows = analysis.slice(firstVisibleRow, firstVisibleRow + this.visibleRowCount);
    const bottom = analysis.length * this.rowHeight;
    return (
      <div className="panel panel-default analysisView">
        <div className="panel-heading toolHeader">
          {"analyse"}
        </div>
        <div className="panel-body">
          <div className="analysisChoiceContainer">
            <select onChange={this.onChangeAnalysisMode} value={selectedMode}>
              <option value="symbols">{"Simple"}</option>
              <option value="bigrams">{"Double"}</option>
            </select>
            {selectedMode === 'bigrams' &&
              <label>
                <input type="checkbox" value={repeatedBigrams} onChange={this.onChangeRepeatedBigramsFilter} />
                {"afficher uniquement les bigrammes répétés"}
              </label>}
          </div>
          <div className="analysisBox-label">Nombres qui précèdent le plus fréquemment :</div>
          <div className="analysisBox-label">Nombres qui suivent le plus fréquemment :</div>
          <div className="analysisBox" style={{position: 'relative'}} ref={this.refScrollBox} onScroll={this.onScroll}>
            {visibleRows.map((content, index) =>
              <SymbolAnalysisRow key={firstVisibleRow + index} top={(firstVisibleRow + index) * this.rowHeight} substitution={substitution} {...content} />)}
            <div style={{position: 'absolute', top: `${bottom}px`, width: '1px', height: '1px'}} />
          </div>
        </div>
      </div>
    );
  }
}

function AnalysisSelector (state) {
  const {dump, workspace} = state;
  const {analysisMode} = dump;
  const {substitution, analysis} = workspace;
  const {analysisModeChanged, repeatedBigramsFilterChanged} = state.actions;

  return {
    substitution, analysis, selectedMode: analysisMode,
    analysisModeChanged, repeatedBigramsFilterChanged
  };
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

export default {
  actions: {
    repeatedBigramsFilterChanged: 'Workspace.RepeatedBigramsFilter.Changed',
    analysisModeChanged: 'Workspace.AnalysisMode.Changed',
  },
  actionReducers: {
    repeatedBigramsFilterChanged: repeatedBigramsFilterChangedReducer,
    analysisModeChanged: analysisModeChangedReducer,
  },
  views: {
    Analysis: connect(AnalysisSelector)(Analysis),
  }
};