
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
import {letterToDisplayString} from '../utils';
import {SYMBOL_DIGITS} from '../constants';

const CipherTextCharPair = EpicComponent(self => {
  self.render = function() {
    const {symbol, letter, isHint, hlSymbol, hlBigramFirst, hlBigramSecond} = self.props;
    const classes = [
      "cipherTextCharPair", "charPair",
      isHint && "isHint",
      hlSymbol && "pairHighlightedToggle",
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

  function refTextBox (element) {
    function scrollToPosition (index) {
      const childElement = element.children[index];
      element.scrollTop = childElement.offsetTop - element.offsetTop - (element.clientHeight / 2);
    }
    self.props.setTextBoxInterface(element && {scrollToPosition});
  }

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
          <div className="cipherTextBox" ref={refTextBox}>
            {combinedText.map(function(symbol, index) {
              const isSearched = index >= searchCursor.first && index <= searchCursor.last;
              return <CipherTextCharPair key={index} isSearched={isSearched} {...combinedText[index]} />;
            })}
          </div>
        </div>
      </div>
    );
  };
});