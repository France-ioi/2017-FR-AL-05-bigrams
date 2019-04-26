
import React from 'react';
import {CipherTextView} from './views/cipherText';
import {SubstitutionEdit} from './views/substitutionEdit';
import {HighlightAndSearch} from './views/highlight';
import {Analysis} from './views/analysis';


export default class Views extends React.PureComponent {

  onSubstitutionChange = (index, letter) => {
    this.props.dispatch({type: this.props.actions.changeSubstitution, index, letter});
  }

  onLockSymbol = (index, value) => {
    this.props.dispatch({type: this.props.actions.lockSymbol, index, value});
  }

  onChangeSymbolHighlight = (symbol, highlight) => {
    this.props.dispatch({type: this.props.actions.changeSymbolHighlight, symbol, highlight});
  }

  onBigramSymbolChange = (index, value) => {
    value = value.replace(/[^0-9]+/, '');
    this.props.dispatch({type: this.props.actions.changeBigramHighlightSymbols, index, value});
  }

  onBigramLetterChange = (index, value) => {
    value = value.toUpperCase().replace(/[^A-Z]+/, '');
    this.props.dispatch({type: this.props.actions.changeBigramHighlightLetters, index, value});
  }

  onClearAllHighlight = () => {
    this.props.dispatch({type: this.props.actions.clearAllHighlight});
  }

  onClickSearch = (forward, bigrams) => {
    this.props.dispatch({type: this.props.actions.onSearch, forward, bigrams});
  }

  onChangeFilter = (kind, value) => {
    this.props.dispatch({type: this.props.actions.filterChanged, kind, value});
  }

  onChangeAnalysisMode = (value) => {
    this.props.dispatch({type: this.props.actions.analysisModeChanged, value});
  }

  onChangeRepeatedBigramsFilter = (value) => {
    this.props.dispatch({type: this.props.actions.repeatedBigramsFilterChanged, value});
  }

  onColorPicked = (index) => {
    this.props.dispatch({type: this.props.actions.colorPicked, index});
  }

  setTextBoxInterface = (intf) => {
    this.props.dispatch({type: this.props.actions.setTextBoxInterface, intf});
  }

  render () {
    const {task, dump, workspace, hintRequestData, selectedColorIndex} = this.props;
    const {hints, baseScore, hintCost} = task;
    const {symbolAttrs, highlightedBigramSymbols, highlightedBigramLetters, searchCursor, filters, analysisMode} = dump;
    const {combinedText, substitution, analysis} = workspace;
    return (
      <div className="taskWrapper">
        {/*<pre>{JSON.stringify(submitAnswer, null, 2)}</pre>*/}
        <SubstitutionEdit symbolAttrs={symbolAttrs} substitution={substitution}
          onChange={this.onSubstitutionChange} onLockSymbol={this.onLockSymbol}
          onShowHintRequest={this.onShowHintRequest} onCloseHintRequest={this.onCloseHintRequest}
          baseScore={baseScore} hintCost={hintCost}
          onRequestHint={this.onRequestHint} hintRequestData={hintRequestData} hints={hints} />
        <CipherTextView
          combinedText={combinedText} searchCursor={searchCursor}
          setTextBoxInterface={this.setTextBoxInterface} />
        <HighlightAndSearch
          selectedColorIndex={selectedColorIndex}
          substitution={substitution}
          highlightedBigramSymbols={highlightedBigramSymbols}
          highlightedBigramLetters={highlightedBigramLetters}
          filters={filters}
          onColorPicked={this.onColorPicked}
          onChangeSymbolHighlight={this.onChangeSymbolHighlight}
          onBigramSymbolChange={this.onBigramSymbolChange}
          onBigramLetterChange={this.onBigramLetterChange}
          onClickSearch={this.onClickSearch}
          onChangeFilter={this.onChangeFilter}
          onChangeMode={this.onChangeAnalysisMode}
          onClearAll={this.onClearAllHighlight}
        />
        <Analysis substitution={substitution} analysis={analysis}
          selectedMode={analysisMode}
          onChangeMode={this.onChangeAnalysisMode}
          onChangeRepeatedBigramsFilter={this.onChangeRepeatedBigramsFilter} />
      </div>
    );
  }

  /********************* From reused key. ***********************/

  onRequestHint = () => {
    this.props.dispatch({type: this.props.actions.requestHint, payload: {request: this.props.hintRequestData}});
  }

  onShowHintRequest = (index) => {
    this.props.dispatch({type: this.props.actions.showHintRequest, request: {index}});
  }

  onCloseHintRequest = () => {
    this.props.dispatch({type: this.props.actions.showHintRequest, request: null});
  }
}
