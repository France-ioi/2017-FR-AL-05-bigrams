
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
import {letterToDisplayString, letterToEditString, symbolToDisplayString} from '../utils';

const SubstitutionEditCharPair = EpicComponent(self => {
  const onChange = function(event) {
    const {index} = self.props;
    const value = event.target.value;
    self.props.onChange(index, value);
  };
  const onFocus = function(event) {
    event.target.select();
  };
  const onClick = function() {
    self.props.onShowHintRequest(self.props.index);
  };
  self.render = function() {
    const {symbol, letter} = self.props;
    return (
      <div className={classnames(["substitutionEditCharPair", "charPair"])} >
        <div className={classnames(["substitutionEditSymbol", "pairTop"])} onClick={onClick}>
          {symbol}
        </div>
        <div className={classnames(["substitutionEditLetter", "pairBottom"])}>
          <input value={letter} maxLength="1" className="substitutionLetterInput" onChange={onChange} onFocus={onFocus} onClick={onFocus} />
        </div>
      </div>
    );
  };
});

export const SubstitutionEdit = EpicComponent(self => {

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
    const {hints, hintRequest, onRequestHint, onCloseHintRequest} = self.props;
    const highestPossibleScore = Math.max(0, maximumScore - Object.keys(hints).length * hintCost);
    const position = `0${hintRequest.index}`.slice(-2);
    return (
      <div className="hintsDialog">
        <p><strong>{"Indice demandé : "}</strong>{"Valeur pour la position "}<strong>{position}</strong></p>
        <p><strong>{"Coût : "}</strong> {hintCost}</p>
        <p><strong>{"Score disponible : "}</strong>{highestPossibleScore}</p>
        <p className="text-center">
          <Button onClick={onRequestHint}>{"Valider"}</Button>
          <Button onClick={onCloseHintRequest}>{"Annuler"}</Button>
        </p>
      </div>
    );
  }

  self.render = function() {
    const {substitution, onChange, onShowHintRequest, hintRequest} = self.props;
    return (
      <div className="panel panel-default substitutionView">
        <div className="panel-heading toolHeader">
          Substitution edition and hints
        </div>
        <div className="panel-body">
          {hintRequest && renderHintRequest()}
          <div className="toolDescription">
            Click on a symbol to edit the corresponding letter or obtain a hint.
          </div>
          <div className="substitutionBox">
            {substitution.map(function(subObject, index) {
              const letter = letterToEditString(subObject.letter);
              const symbol = symbolToDisplayString(index);
              return <SubstitutionEditCharPair key={index} letter={letter} symbol={symbol} index={index} onChange={onChange} onShowHintRequest={onShowHintRequest} />;
            })}
          </div>
        </div>
      </div>
    );
  };
});