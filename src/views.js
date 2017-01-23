
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

  const onHighlightToggle = function(index, letter) {
    self.props.dispatch({type: actions.toggleHighlight, index});
  };

  const onBigramSymbolChange = function(index, value) {
    self.props.dispatch({type: actions.changeBigramHighlight, index, value, charType: "symbols"});
  };

  const onBigramLetterChange = function(index, value) {
    self.props.dispatch({type: actions.changeBigramHighlight, index, value, charType: "letters"});
  };

  const onClickSearch = function(forward, bigrams) {
    self.props.dispatch({type: actions.onSearch, forward, bigrams});
  };

  self.render = function () {
    const {task, workspace, score, hintRequest, submitAnswer} = self.props;
    const {substitution, highlightToggleState, highlightBigrams, searchIndex, searchBigrams, analysis} = workspace;
    const {cipherText, numSymbols} = task;
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
          <p>[Instructions]</p>
          {hintRequest && renderHintRequest()}
        </div>
        <CipherTextView cipherText={cipherText} substitution={substitution} highlightToggleState={highlightToggleState} highlightBigrams={highlightBigrams} searchIndex={searchIndex} searchBigrams={searchBigrams} />
        <SubstitutionEdit substitution={substitution} onChange={onSubstitutionChange} onRequestHint={onShowHintRequest} />
        <HighlightAndSearch
          substitution={substitution}
          onHighlightToggle={onHighlightToggle}
          highlightToggleState={highlightToggleState}
          onBigramSymbolChange={onBigramSymbolChange}
          onBigramLetterChange={onBigramLetterChange}
          highlightBigrams={highlightBigrams}
          onClickSearch={onClickSearch}
        />
        <Analysis substitution={substitution} analysis={analysis} />
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

  function renderHintRequest () {
    const allowHints = true;
    if (!allowHints) {
      <div className="hintsDialog">
        <p><strong>{"Les indices seront bientôt disponibles."}</strong></p>
        <p className="text-center">
          <Button onClick={onCloseHintRequest}>{"Annuler"}</Button>
        </p>
      </div>
    }
    const maximumScore = 150;
    const hintCost = 20;
    const {task, hintRequest} = self.props;
    const highestPossibleScore = Math.max(0, maximumScore - Object.keys(task.hints).length * hintCost);
    return (
      <div className="hintsDialog">
        <p><strong>{"Indice demandé : "}</strong>{"Valeur pour la position "}<strong>{hintRequest.index}</strong></p>
        <p><strong>{"Coût : "}</strong> {hintCost}</p>
        <p><strong>{"Score disponible : "}</strong>{highestPossibleScore}</p>
        <p className="text-center">
          <Button onClick={onRequestHint}>{"Valider"}</Button>
          <Button onClick={onCloseHintRequest}>{"Annuler"}</Button>
        </p>
      </div>
    );
  }

}, {displayName: 'View'});
