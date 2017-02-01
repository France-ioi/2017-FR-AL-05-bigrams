
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
import {letterToDisplayString, symbolToDisplayString} from '../utils';

const SubstitutionEditCharPair = EpicComponent(self => {
  const onLetterChange = function(event) {
    const {index} = self.props;
    const value = event.target.value.trim().toUpperCase();
    self.props.onChange(index, value);
  };
  const onFocus = function(event) {
    event.target.select();
  };
  const onSymbolClick = function() {
    self.props.onShowHintRequest(self.props.index);
  };
  const onLockClick = function() {
    if (self.props.letter) {
      self.props.onLockSymbol(self.props.index, !self.props.isLocked);
    }
  };
  self.render = function() {
    const {symbol, letter, isLocked} = self.props;
    const classes = ['substitutionEditCharPair', 'charPair', isLocked && 'isLocked']
    return (
      <div className={classnames(classes)}>
        <div className="substitutionEditSymbol pairTop clickable" onClick={onSymbolClick}>
          {symbol}
        </div>
        <div className="substitutionEditLetter pairBottom">
          {isLocked
            ? <input value={letter} className="substitutionLetterInput" readOnly />
            : <input value={letter} maxLength="1" className="substitutionLetterInput" onChange={onLetterChange} onFocus={onFocus} onClick={onFocus} />}
          <i onClick={onLockClick} className={classnames(['fa', isLocked ? 'fa-lock' : 'fa-unlock-alt', !letter && 'lockDisabled'])}></i>
        </div>
      </div>
    );
  };
});

const SubstitutionEditHint = EpicComponent(self => {
  self.render = function() {
    const {symbol, letter} = self.props;
    return (
      <div className="substitutionEditCharPair charPair isHint">
        <div className="substitutionEditSymbol pairTop">
          {symbol}
        </div>
        <div className="substitutionEditLetter pairBottom">
          <input value={letter} className="substitutionLetterInput" readOnly />
        </div>
      </div>
    );
  };
});

export const SubstitutionEdit = EpicComponent(self => {

  function renderHintRequest () {
    const {baseScore, hintCost} = self.props;
    const allowHints = true;
    if (!allowHints) {
      <div className="hintsDialog">
        <p><strong>{"Les indices seront bientôt disponibles."}</strong></p>
        <p className="text-center">
          <Button onClick={onCloseHintRequest}>{"Annuler"}</Button>
        </p>
      </div>
    }
    const {hints, hintRequest, onRequestHint, onCloseHintRequest} = self.props;
    const hintsGranted = hints.filter(x => x !== null).length;
    const highestPossibleScore = Math.max(0, baseScore - hintsGranted * hintCost);
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
    const {symbolAttrs, substitution, onChange, onLockSymbol, onShowHintRequest, hints, hintRequest} = self.props;
    return (
      <div className="panel panel-default substitutionView">
        <div className="panel-heading toolHeader">
          substitution et indices
        </div>
        <div className="panel-body">
          {hintRequest && renderHintRequest()}
          <p className="toolDescription">
            Cliquez sous un nombre pour éditer la lettre qui correspond, ou sur le nombre pour l'obtenir en indice.
          </p>
          <div className="substitutionBox">
            {substitution.map(function(subObject, index) {
              const symbol = symbolToDisplayString(index);
              if (hints[index] !== null) {
                return <SubstitutionEditHint key={index} letter={hints[index]} symbol={symbol} />;
              } else {
                const {letter, isLocked} = symbolAttrs[index];
                return <SubstitutionEditCharPair key={index} index={index} symbol={symbol} letter={letter} isLocked={isLocked} onChange={onChange} onShowHintRequest={onShowHintRequest} onLockSymbol={onLockSymbol} />;
              }
            })}
          </div>
        </div>
      </div>
    );
  };
});