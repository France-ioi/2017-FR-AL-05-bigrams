
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
import {symbolToDisplayString, letterToDisplayString} from '../utils';
import {SYMBOL_DIGITS} from '../constants';

const CipherTextCharPair = EpicComponent(self => {
  self.render = function() {
    const {symbol, letter, isHighlightedToggle, isHighlightedBigram, isSearched} = self.props;
    return (
      <div className={classnames(["cipherTextCharPair", "charPair", isHighlightedToggle && "pairHighlightedToggle", isHighlightedBigram && "pairHighlightedBigram", isSearched && "isSearched"])}>
        <div className={classnames(["cipherTextSymbol", "pairTop"])}>
          {symbol}
        </div>
        <div className={classnames(["cipherTextLetter", "pairBottom"])}>
          {letter}
        </div>
      </div>
    );
  };
});

export const CipherTextView = EpicComponent(self => {
  const checkHighlightedBigram = function(index) {
    const {cipherText, highlightBigrams, substitution} = self.props;
    const symbol = cipherText[index];
    const displaySymbol = symbolToDisplayString(symbol)

    let isHighlightedBigram = false;
    let bigramSymbols1, bigramSymbols2, bigramLetters1, bigramLetters2;
    if(index > 0) {
      bigramSymbols1 = symbolToDisplayString(cipherText[index - 1]) + displaySymbol;
      bigramLetters1 = substitution[cipherText[index - 1]].letter + substitution[symbol].letter;
    }
    if(index < cipherText.length - 1) {
      bigramSymbols2 = displaySymbol + symbolToDisplayString(cipherText[index + 1]);
      bigramLetters2 = substitution[symbol].letter + substitution[cipherText[index + 1]].letter;
    }
    const highlightedBigramsSymbols = highlightBigrams.counts.symbols;
    const highlightedBigramsLetters = highlightBigrams.counts.letters;
    isHighlightedBigram = highlightedBigramsSymbols[bigramSymbols1] ||
                          highlightedBigramsSymbols[bigramSymbols2] ||
                          highlightedBigramsLetters[bigramLetters1] ||
                          highlightedBigramsLetters[bigramLetters2];
    return isHighlightedBigram;
  };

  const checkSearched = function(index) {
    const {searchIndex, searchBigrams} = self.props;
    if(index === searchIndex) {
      return true;
    }
    if(searchIndex !== null && searchBigrams && index === searchIndex + 1) {
      return true;
    }
    return false;
  };

  self.render = function() {
    const {cipherText, substitution, highlightToggleState} = self.props;
    return (
      <div className="panel panel-default cipherTextView">
        <div className="panel-heading toolHeader">
          {"Encrypted text and decryption attempt"}
        </div>
        <div className="panel-body">
          <div className="toolDescription">
            Here is the text to decrypt. Your solution attempt is represented as letters under each {SYMBOL_DIGITS} digit symobl.
          </div>
          <div className="cipherTextBox">
            {cipherText.map(function(symbol, index) {
              const letter = letterToDisplayString(substitution[symbol].letter);
              const displaySymbol = symbolToDisplayString(symbol);
              const isHighlightedBigram = checkHighlightedBigram(index);
              const isSearched = checkSearched(index);
              return <CipherTextCharPair key={index} symbol={displaySymbol} letter={letter} isHighlightedToggle={highlightToggleState[symbol]} isHighlightedBigram={isHighlightedBigram} isSearched={isSearched} />;
            })}
          </div>
        </div>
      </div>
    );
  };
});