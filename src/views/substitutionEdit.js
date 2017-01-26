
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
    self.props.onRequestHint(self.props.index);
  };
  self.render = function() {
    const {symbol, letter} = self.props;
    return (
      <div className={classnames(["substitutionEditCharPair", "charPair"])} >
        <div className={classnames(["substitutionEditSymbol", "pairTop"])} onClick={onClick}>
          {symbol}
        </div>
        <br/>
        <div className={classnames(["substitutionEditLetter", "pairBottom"])}>
          <input value={letter} maxLength="1" className="substitutionLetterInput" onChange={onChange} onFocus={onFocus} onClick={onFocus} />
        </div>
      </div>
    );
  };
});

export const SubstitutionEdit = EpicComponent(self => {
  self.render = function() {
    const {substitution, onChange, onRequestHint} = self.props;
    return (
      <div className="panel panel-default substitutionView">
        <div className="panel-heading toolHeader">
          Substitution edition and hints
        </div>
        <div className="panel-body">
          <div className="toolDescription">
            Click on a symbol to edit the corresponding letter or obtain a hint.
          </div>
          <div className="substitutionBox">
            {substitution.map(function(subObject, index) {
              const letter = letterToEditString(subObject.letter);
              const symbol = symbolToDisplayString(index);
              return <SubstitutionEditCharPair key={index} letter={letter} symbol={symbol} index={index} onChange={onChange} onRequestHint={onRequestHint} />;
            })}
          </div>
        </div>
      </div>
    );
  };
});