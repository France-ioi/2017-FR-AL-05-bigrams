
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
        {displaySymbols}
        <br/>
        {text}
        <br/>
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
      <div className="analysisView">
        <div className="toolHeader">
          Analysis
        </div>
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
                    <td>
                      <AnalysisBox array={symbolAnalysis.before} substitution={substitution} />
                    </td>
                    <td>
                      <AnalysisTriplet symbols={symbolAnalysis.symbolArray} count={symbolAnalysis.count} text={symbolsToDisplayLetters(substitution, symbolAnalysis.symbolArray)} />
                    </td>
                    <td>
                      <AnalysisBox array={symbolAnalysis.after} substitution={substitution} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
});