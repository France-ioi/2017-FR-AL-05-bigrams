
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';

import {
  symbolToDisplayString, letterToDisplayString,
  symbolsToDisplayLetters} from '../utils';
import {getBackgroundColor} from '../constants';

const AnalysisTriplet = EpicComponent(self => {
  self.render = function() {
    const {symbols, letters, count} = self.props;
    return (
      <div className="analysisTriplet">
        <div className="analysisCharPair charPair">
          <div className="pairTop">{symbols}</div>
          <div className="pairBottom">{letters}</div>
        </div>
        {count}{"x"}
      </div>
    );
  };
});

const AnalysisSymbolTriplet = EpicComponent(self => {
  self.render = function() {
    const {symbol, substitution, count} = self.props;
    const {letter, isHint, highlight} = substitution[symbol];
    const symbolStr = symbolToDisplayString(symbol);
    const letterStr = letterToDisplayString(letter);
    const classes = [
      "analysisCharPair", "charPair", isHint && "isHint"
    ];
    const color = getBackgroundColor(highlight, isHint, false);
    return (
      <div className="analysisTriplet" style={{backgroundColor: color}}>
        <div className={classnames(classes)}>
          <div className="pairTop">{symbolStr}</div>
          <div className="pairBottom">{letterStr}</div>
        </div>
        {count}{"x"}
      </div>
    );
  };
});

const AnalysisBox = EpicComponent(self => {
  self.render = function() {
    const {array, substitution} = self.props;
    return (
      <div className="analysisSmallBox">
        {array.map(function(analysisObject, index) {
          return <AnalysisSymbolTriplet key={index} symbol={analysisObject.symbol} count={analysisObject.count} substitution={substitution} />;
        })}
      </div>
    );
  };
});

const SymbolAnalysisRow = EpicComponent(self => {
  self.render = function() {
    const {top, substitution, symbolString, symbolArray, count, before, after} = self.props;
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
  };
});

export const Analysis = EpicComponent(self => {

  let scrollBoxElement;
  const rowHeight = 80;
  const visibleRowCount = 5;

  function onChangeMode (event) {
    self.props.onChangeMode(event.target.value);
  }

  function onChangeRepeatedBigramsFilter (event) {
    self.props.onChangeRepeatedBigramsFilter(event.target.checked);
  }

  function refScrollBox (element) {
    scrollBoxElement = element;
  }

  function onScroll (event) {
    const firstVisibleRow = Math.trunc(scrollBoxElement.scrollTop / rowHeight);
    self.setState({firstVisibleRow});
  }

  self.state = {firstVisibleRow: 0};

  self.render = function() {
    const {substitution, analysis, selectedMode, repeatedBigrams} = self.props;
    const {firstVisibleRow} = self.state;
    const visibleRows = analysis.slice(firstVisibleRow, firstVisibleRow + visibleRowCount);
    const bottom = analysis.length * rowHeight;
    return (
      <div className="panel panel-default analysisView">
        <div className="panel-heading toolHeader">
          {"analyse"}
        </div>
        <div className="panel-body">
          <div className="analysisChoiceContainer">
            <select onChange={onChangeMode} value={selectedMode}>
              <option value="symbols">{"Simple"}</option>
              <option value="bigrams">{"Double"}</option>
            </select>
            {selectedMode === 'bigrams' &&
              <label>
                <input type="checkbox" value={repeatedBigrams} onChange={onChangeRepeatedBigramsFilter}/>
                {"afficher uniquement les bigrammes répétés"}
              </label>}
          </div>
          <div className="analysisBox-label">Nombres qui précèdent le plus fréquemment :</div>
          <div className="analysisBox-label">Nombres qui suivent le plus fréquemment :</div>
          <div className="analysisBox" style={{position: 'relative'}} ref={refScrollBox} onScroll={onScroll}>
            {visibleRows.map((content, index) =>
              <SymbolAnalysisRow key={firstVisibleRow + index} top={(firstVisibleRow + index) * rowHeight} substitution={substitution} {...content} />)}
            <div style={{position: 'absolute', top: `${bottom}px`, width: '1px', height: '1px'}}/>
          </div>
        </div>
      </div>
    );
  };
});