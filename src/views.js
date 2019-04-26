
import React from '../node_modules/react/react';
import {Alert, Button} from '../node_modules/react-bootstrap/lib';
import classnames from '../node_modules/classnames';
import EpicComponent from '../node_modules/epic-component/lib';

import {extractClearText} from './utils';
import {CipherTextView} from './views/cipherText';
import {SubstitutionEdit} from './views/substitutionEdit';
import {HighlightAndSearch} from './views/highlight';
import {Analysis} from './views/analysis';

export default EpicComponent(self => {

  const onSubstitutionChange = function (index, letter) {
    self.props.dispatch({type: self.props.actions.changeSubstitution, index, letter});
  };

  const onLockSymbol = function (index, value) {
    self.props.dispatch({type: self.props.actions.lockSymbol, index, value});
  };

  const onChangeSymbolHighlight = function (symbol, highlight) {
    self.props.dispatch({type: self.props.actions.changeSymbolHighlight, symbol, highlight});
  };

  const onBigramSymbolChange = function (index, value) {
    value = value.replace(/[^0-9]+/, '');
    self.props.dispatch({type: self.props.actions.changeBigramHighlightSymbols, index, value});
  };

  const onBigramLetterChange = function (index, value) {
    value = value.toUpperCase().replace(/[^A-Z]+/, '');
    self.props.dispatch({type: self.props.actions.changeBigramHighlightLetters, index, value});
  };

  const onClearAllHighlight = function () {
    self.props.dispatch({type: self.props.actions.clearAllHighlight});
  };

  const onClickSearch = function (forward, bigrams) {
    self.props.dispatch({type: self.props.actions.onSearch, forward, bigrams});
  };

  const onChangeFilter = function (kind, value) {
    self.props.dispatch({type: self.props.actions.filterChanged, kind, value});
  };

  const onChangeAnalysisMode = function (value) {
    self.props.dispatch({type: self.props.actions.analysisModeChanged, value});
  };

  const onChangeRepeatedBigramsFilter = function (value) {
    self.props.dispatch({type: self.props.actions.repeatedBigramsFilterChanged, value});
  };

  const onColorPicked = function (index) {
    self.props.dispatch({type: self.props.actions.colorPicked, index});
  };

  const setTextBoxInterface = function (intf) {
    self.props.dispatch({type: self.props.actions.setTextBoxInterface, intf});
  };

  self.render = function () {
    const {task, dump, workspace, hintRequestData, selectedColorIndex} = self.props;
    const {cipherText, hints, baseScore, hintCost} = task;
    const {symbolAttrs, highlightedBigramSymbols, highlightedBigramLetters, searchCursor, filters, analysisMode, repeatedBigrams} = dump;
    const {numSymbols, combinedText, substitution, analysis} = workspace;
    return (
      <div className="taskWrapper">
        {/*<pre>{JSON.stringify(submitAnswer, null, 2)}</pre>*/}
        <SubstitutionEdit symbolAttrs={symbolAttrs} substitution={substitution}
          onChange={onSubstitutionChange} onLockSymbol={onLockSymbol}
          onShowHintRequest={onShowHintRequest} onCloseHintRequest={onCloseHintRequest}
          baseScore={baseScore} hintCost={hintCost}
          onRequestHint={onRequestHint} hintRequestData={hintRequestData} hints={hints} />
        <CipherTextView
          combinedText={combinedText} searchCursor={searchCursor}
          setTextBoxInterface={setTextBoxInterface} />
        <HighlightAndSearch
          selectedColorIndex={selectedColorIndex}
          substitution={substitution}
          highlightedBigramSymbols={highlightedBigramSymbols}
          highlightedBigramLetters={highlightedBigramLetters}
          filters={filters}
          onColorPicked={onColorPicked}
          onChangeSymbolHighlight={onChangeSymbolHighlight}
          onBigramSymbolChange={onBigramSymbolChange}
          onBigramLetterChange={onBigramLetterChange}
          onClickSearch={onClickSearch}
          onChangeFilter={onChangeFilter}
          onChangeMode={onChangeAnalysisMode}
          onClearAll={onClearAllHighlight}
        />
        <Analysis substitution={substitution} analysis={analysis}
          selectedMode={analysisMode}
          onChangeMode={onChangeAnalysisMode}
          onChangeRepeatedBigramsFilter={onChangeRepeatedBigramsFilter} />
      </div>
    );
  };

  /********************* From reused key. ***********************/


  const onRequestHint = function () {
    self.props.dispatch({type: self.props.actions.requestHint,  payload: {request: self.props.hintRequestData}});
  };

  const onShowHintRequest = function (index) {
    self.props.dispatch({type: self.props.actions.showHintRequest, request: {index}});
  };

  const onCloseHintRequest = function () {
    self.props.dispatch({type: self.props.actions.showHintRequest, request: null});
  };
});
