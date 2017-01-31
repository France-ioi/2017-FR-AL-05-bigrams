
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

export const Analysis = EpicComponent(self => {
  const onChangeMode = function (event) {
    self.props.onChangeMode(event.target.value);
  };
  const onChangeRepeatedBigramsFilter = function (event) {
    self.props.onChangeRepeatedBigramsFilter(event.target.checked);
  };
  self.render = function() {
    const {substitution, analysis, selectedMode, repeatedBigrams} = self.props;
    return (
      <div className="panel panel-default analysisView">
        <div className="panel-heading toolHeader">
          {"analyse"}
        </div>
        <div className="panel-body">
          <div className="analysisChoiceContainer">
            <select onChange={onChangeMode} value={selectedMode}>
              <option value="symbols">{"Symboles"}</option>
              <option value="bigrams">{"Bigrammes"}</option>
            </select>
            {selectedMode === 'bigrams' &&
              <label>
                <input type="checkbox" value={repeatedBigrams} onChange={onChangeRepeatedBigramsFilter}/>
                {"afficher uniquement les bigrammes répétés"}
              </label>}
          </div>
          <div className="analysisBox">
            <div className="analysisBox-label">Nombres qui précèdent le plus fréquemment :</div>
            <div className="analysisBox-label">Nombres qui suivent le plus fréquemment :</div>
              {analysis.map(function(symbolAnalysis, index) {
                const displayLetters = symbolsToDisplayLetters(substitution, symbolAnalysis.symbolArray);
                return (
                  <div key={index} className="analysisBox-row">
                    <div className="analysisBox-before">
                      <AnalysisBox array={symbolAnalysis.before} substitution={substitution} />
                    </div>
                    <div className="analysisBox-center">
                      <AnalysisTriplet symbols={symbolAnalysis.symbolString} letters={displayLetters} count={symbolAnalysis.count} />
                    </div>
                    <div className="analysisBox-after">
                      <AnalysisBox array={symbolAnalysis.after} substitution={substitution} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  };
});