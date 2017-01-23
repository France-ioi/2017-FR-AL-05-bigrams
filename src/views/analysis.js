
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
import {letterToDisplayString, symbolToDisplayString} from '../utils';

const AnalysisTriplet = EpicComponent(self => {
  self.render = function() {
    const {symbol, letter, count} = self.props;
    const displaySymbol = symbolToDisplayString(symbol);
    const displayLetter = letterToDisplayString(letter);
    return (
      <div className="analysisTriplet">
        {displaySymbol}
        <br/>
        {displayLetter}
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
          return <AnalysisTriplet key={index} symbol={analysisObject.symbol} count={analysisObject.count} letter={substitution[analysisObject.symbol].letter} />;
        })}
      </div>
    );
  };
});

export const Analysis = EpicComponent(self => {
  self.render = function() {
    const {substitution, analysis} = self.props;
    return (
      <div className="analysisView">
        <div className="toolHeader">
          Analysis
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
              {analysis.symbols.map(function(symbolAnalysis, index) {
                return (
                  <tr key={index}>
                    <td>
                      <AnalysisBox array={symbolAnalysis.before} substitution={substitution} />
                    </td>
                    <td>
                      <AnalysisTriplet symbol={symbolAnalysis.symbol} count={symbolAnalysis.count} letter={substitution[index].letter} />
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