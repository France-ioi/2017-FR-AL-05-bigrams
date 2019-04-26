
import React from 'react';

import {
  symbolToDisplayString, letterToDisplayString,
  symbolsToDisplayLetters
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
export class Analysis extends React.PureComponent {

  constructor () {
    super();
    this.scrollBoxElement = null;
    this.rowHeight = 80;
    this.visibleRowCount = 5;
  }

  onChangeMode = (event) => {
    this.props.onChangeMode(event.target.value);
  }

  onChangeRepeatedBigramsFilter = (event) => {
    this.props.onChangeRepeatedBigramsFilter(event.target.checked);
  }

  refScrollBox = (element) => {
    this.scrollBoxElement = element;
  }

  onScroll = () => {
    const firstVisibleRow = Math.trunc(this.scrollBoxElement.scrollTop / this.rowHeight);
    this.setState({firstVisibleRow});
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
            <select onChange={this.onChangeMode} value={selectedMode}>
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