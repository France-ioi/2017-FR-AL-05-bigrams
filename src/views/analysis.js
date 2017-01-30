
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
import {
  symbolToDisplayString, letterToDisplayString,
  symbolsToDisplayLetters} from '../utils';

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
    const target = substitution[symbol];
    const symbolStr = symbolToDisplayString(symbol);
    const letter = letterToDisplayString(target.letter);
    const classes = [
      "analysisCharPair", "charPair",
      target.isHighlighted && "pairHighlightedToggle",
      target.isHint && "isHint"
    ];
    return (
      <div className="analysisTriplet">
        <div className={classnames(classes)}>
          <div className="pairTop">{symbolStr}</div>
          <div className="pairBottom">{letter}</div>
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
  const onChange = function (event) {
    self.props.onChangeMode(event.target.value);
  };
  self.render = function() {
    const {substitution, analysis, selectedMode} = self.props;
    return (
      <div className="panel panel-default analysisView">
        <div className="panel-heading toolHeader">
          {"Analysis"}
        </div>
        <div className="panel-body">
          <div className="analysisChoiceContainer">
            <select onChange={onChange} value={selectedMode}>
              <option value="symbols">Single symbols</option>
              <option value="bigrams">Bigrams</option>
            </select>
          </div>
          <div className="analysisBox">
            <table>
              <tbody>
                <tr>
                  <td></td>
                  <td>
                    Most frequent symbols before:
                  </td>
                  <td></td>
                  <td>
                    Most frequent symbols after:
                  </td>
                </tr>
                {analysis.map(function(symbolAnalysis, index) {
                  const displayLetters = symbolsToDisplayLetters(substitution, symbolAnalysis.symbolArray);
                  return (
                    <tr key={index}>
                      <td className="analysisBox-labels">
                        <div className="charPair-labels">
                          <div className="charPair-label-symb">{"Chiffré"}</div>
                          <div className="charPair-label-letter">{"Clair"}</div>
                        </div>
                      </td>
                      <td className="analysisBox-before">
                        <AnalysisBox array={symbolAnalysis.before} substitution={substitution} />
                      </td>
                      <td className="analysisBox-center">
                        <AnalysisTriplet symbols={symbolAnalysis.symbolString} letters={displayLetters} count={symbolAnalysis.count} />
                      </td>
                      <td className="analysisBox-after">
                        <AnalysisBox array={symbolAnalysis.after} substitution={substitution} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
});