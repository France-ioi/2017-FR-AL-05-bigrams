
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
import {CipherTextView} from './views/cipherText';
import {SubstitutionEdit} from './views/substitutionEdit';
import {HighlightAndSearch} from './views/highlight';
import {Analysis} from './views/analysis';

export const Workspace = actions => EpicComponent(self => {

  /*
  self.state = {dragging: false, dropOutside: false};

  const onKeyChange = function (index, direction) {
    const {key} = self.props.workspace;
    self.props.dispatch({type: actions.keyChange, index, direction});
  };

  const onMouseDown = function (cipherIndex, charIndex) {
    if (!self.props.task.plainWord) return;
    self.setState({dragging: true, dropOutside: false});
    self.props.dispatch({type: actions.setPlainWordPosition, cipherIndex, charIndex});
  };*/

  const onSubstitutionChange = function(index, letter) {
    self.props.dispatch({type: actions.changeSubstitution, index, letter});
  };

  const onLockSymbol = function (index, value) {
    self.props.dispatch({type: actions.lockSymbol, index, value});
  };

  const onHighlightToggle = function(index, letter) {
    self.props.dispatch({type: actions.toggleHighlight, index});
  };

  const onBigramSymbolChange = function(index, value) {
    value = value.replace(/[^0-9]+/, '');
    self.props.dispatch({type: actions.changeBigramHighlightSymbols, index, value});
  };

  const onBigramLetterChange = function(index, value) {
    value = value.toUpperCase().replace(/[^A-Z]+/, '');
    self.props.dispatch({type: actions.changeBigramHighlightLetters, index, value});
  };

  const onClickSearch = function(forward, bigrams) {
    self.props.dispatch({type: actions.onSearch, forward, bigrams});
  };

  const onChangeFilter = function (kind, value) {
    self.props.dispatch({type: actions.filterChanged, kind, value});
  };

  const onChangeAnalysisMode = function (value) {
    self.props.dispatch({type: actions.analysisModeChanged, value});
  };

  const setTextBoxInterface = function (intf) {
    self.props.dispatch({type: actions.setTextBoxInterface, intf});
  };

  self.render = function () {
    const {task, dump, workspace, score, hintRequest, submitAnswer} = self.props;
    const {cipherText, hints} = task;
    const {symbolAttrs, highlightedBigramSymbols, highlightedBigramLetters, searchCursor, filters, analysisMode} = dump;
    const {numSymbols, combinedText, substitution, analysis} = workspace;
    return (
      <div className="taskWrapper">
        {/*<pre>{JSON.stringify(submitAnswer, null, 2)}</pre>*/}
        <div className="taskHeader">
          <div className="submitBlock">
            <Button onClick={onSubmitAnswer} disabled={submitAnswer && submitAnswer.status === 'pending'}>
              {"soumettre la clé"}
            </Button>
          </div>
          {submitAnswer.feedback !== undefined &&
            <div className="feedbackBlock" onClick={onDismissAnswerFeedback}>
              {submitAnswer.feedback === true &&
                <span>
                  <i className="fa fa-check" style={{color: 'green'}}/>
                  {" Votre réponse est correcte."}
                </span>}
              {submitAnswer.feedback === false &&
                <span>
                  <i className="fa fa-close" style={{color: 'red'}}/>
                  {" Votre réponse est incorrecte."}
                </span>}
            </div>}
          <div className="scoreBlock">
            {"Score : "}{score === undefined ? '-' : score}
          </div>
          {<div className="saveBlock"><actions.SaveButton/></div>}
        </div>
        {submitAnswer.status === 'rejected' && (
          submitAnswer.error === 'too soon'
            ? <Alert bsStyle='warning'>{"Trop de réponses en une minute."}</Alert>
            : <Alert bsStyle='error'>{"Votre réponse n'a pas pu être prise en compte."}</Alert>)}
        <div className="taskInstructions">
        </div>
        <SubstitutionEdit symbolAttrs={symbolAttrs} substitution={substitution}
          onChange={onSubstitutionChange} onLockSymbol={onLockSymbol}
          onShowHintRequest={onShowHintRequest} onCloseHintRequest={onCloseHintRequest}
          onRequestHint={onRequestHint} hintRequest={hintRequest} hints={hints} />
        <CipherTextView
          combinedText={combinedText} searchCursor={searchCursor}
          setTextBoxInterface={setTextBoxInterface} />
        <HighlightAndSearch
          selectedColorIndex={0}
          substitution={substitution}
          highlightedBigramSymbols={highlightedBigramSymbols}
          highlightedBigramLetters={highlightedBigramLetters}
          filters={filters}
          onHighlightToggle={onHighlightToggle}
          onBigramSymbolChange={onBigramSymbolChange}
          onBigramLetterChange={onBigramLetterChange}
          onClickSearch={onClickSearch}
          onChangeFilter={onChangeFilter}
        />
        <Analysis substitution={substitution} analysis={analysis}
          selectedMode={analysisMode}
          onChangeMode={onChangeAnalysisMode} />
      </div>
    );
  };

  /********************* From reused key. ***********************/

  const onSubmitAnswer = function () {
    const answer = {substitution: self.props.workspace.substitution};
    self.props.dispatch({type: actions.submitAnswer, answer});
  };

  const onDismissAnswerFeedback = function () {
    self.props.dispatch({type: actions.dismissAnswerFeedback});
  };

  const onRequestHint = function () {
    self.props.dispatch({type: actions.requestHint, request: self.props.hintRequest});
  };

  const onShowHintRequest = function (index) {
    self.props.dispatch({type: actions.showHintRequest, request: {index}});
  };

  const onCloseHintRequest = function () {
    self.props.dispatch({type: actions.showHintRequest, request: null});
  };

}, {displayName: 'View'});
