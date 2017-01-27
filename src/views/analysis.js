
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
import {letterToDisplayString, symbolsToDisplayString, symbolsToDisplayLetters} from '../utils';

const AnalysisTriplet = EpicComponent(self => {
  self.render = function() {
    const {symbols, text, count} = self.props;
    const displaySymbols = symbolsToDisplayString(symbols);
    return (
      <div className="analysisTriplet">
        <div className="analysisCharPair charPair">
          <div className="pairTop">{displaySymbols}</div>
          <div className="pairBotton">{text}</div>
        </div>
        {count}x
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
          return <AnalysisTriplet key={index} symbols={analysisObject.symbolArray} count={analysisObject.count} text={symbolsToDisplayLetters(substitution, analysisObject.symbolArray)} />;
        })}
      </div>
    );
  };
});

export const Analysis = EpicComponent(self => {
  self.state = {selectedMode: "symbols"};
  const onChange = function(event) {
    self.setState({selectedMode: event.target.value});
  };
  self.render = function() {
    const {substitution, analysis} = self.props;
    const {selectedMode} = self.state;
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
                {analysis[selectedMode].map(function(symbolAnalysis, index) {
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
                        <AnalysisTriplet symbols={symbolAnalysis.symbolArray} count={symbolAnalysis.count} text={symbolsToDisplayLetters(substitution, symbolAnalysis.symbolArray)} />
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