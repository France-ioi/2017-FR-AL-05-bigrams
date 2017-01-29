
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
import {letterToDisplayString} from '../utils';
import {SYMBOL_DIGITS} from '../constants';

const CipherTextCharPair = EpicComponent(self => {
  self.render = function() {
    const {symbol, letter, hlSingle, hlBigramFirst, hlBigramSecond} = self.props.cell;
    const classes = [
      "cipherTextCharPair", "charPair",
      hlSingle && "pairHighlightedToggle",
      (hlBigramFirst || hlBigramSecond) && "pairHighlightedBigram",
      self.props.isSearched && "isSearched"
    ];
    return (
      <div className={classnames(classes)}>
        <div className="cipherTextSymbol pairTop">
          {symbol}
        </div>
        <div className="cipherTextLetter pairBottom">
          {letterToDisplayString(letter)}
        </div>
      </div>
    );
  };
});

export const CipherTextView = EpicComponent(self => {

  const defaultCipherAttrs = {highlight: false};

  self.render = function() {
    const {combinedText, searchCursor} = self.props;
    return (
      <div className="panel panel-default cipherTextView">
        <div className="panel-heading toolHeader">
          {"Encrypted text and decryption attempt"}
        </div>
        <div className="panel-body">
          <p className="toolDescription">
            Here is the text to decrypt. Your solution attempt is represented as letters under each {SYMBOL_DIGITS} digit symobl.
          </p>
          <div className="cipherTextBox">
            {combinedText.map(function(symbol, index) {
              const isSearched = index >= searchCursor.first && index <= searchCursor.last;
              return <CipherTextCharPair key={index} cell={combinedText[index]} isSearched={isSearched} />;
            })}
          </div>
        </div>
      </div>
    );
  };
});