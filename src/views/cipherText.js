
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
import {letterToDisplayString} from '../utils';
import {SYMBOL_DIGITS, getBackgroundColor} from '../constants';

const CipherTextCharPair = EpicComponent(self => {
  self.render = function() {
    const {symbol, letter, isHint, isLocked, isSearched, highlight, hlSymbol, hlBigramFirst, hlBigramSecond} = self.props;
    const classes = [
      "cipherTextCharPair", "charPair",
      isHint && "isHint",
      isLocked && "isLocked",
      hlSymbol && "highlightedSymbol",
      (hlBigramFirst || hlBigramSecond) && "pairHighlightedBigram",
      isSearched && "isSearched"
    ];
    const color = getBackgroundColor(highlight, isHint, isLocked);
    return (
      <div className={classnames(classes)} style={{backgroundColor: color}}>
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

  let textBoxElement;

  self.state = {
    firstVisibleLine: 0,
    symbolsPerLine: 23,
    lineHeight: 64,
    visibleLines: 6
  };

  const defaultCipherAttrs = {highlight: false};

  function refTextBox (element) {
    function scrollToPosition (index) {
      const childElement = element.children[index];
      element.scrollTop = childElement.offsetTop - element.offsetTop - (element.clientHeight / 2);
    }
    textBoxElement = element;
    self.props.setTextBoxInterface(element && {scrollToPosition});
  }

  function onScroll (event) {
    const {lineHeight} = self.state;
    const firstVisibleLine = Math.trunc(textBoxElement.scrollTop / lineHeight);
    self.setState({firstVisibleLine});
  }

  /*
    - line height : 54 px
    - boxes per line : 23
    - 5 lines displayed
  */
  self.render = function() {
    const {combinedText, searchCursor} = self.props;
    const {scrolling, firstVisibleLine, symbolsPerLine, lineHeight, visibleLines} = self.state;
    const bottom = (Math.trunc(combinedText.length / symbolsPerLine) + 1) * lineHeight;
    const lines = extractLines(combinedText, firstVisibleLine, visibleLines, symbolsPerLine);
    return (
      <div className="panel panel-default cipherTextView">
        <div className="panel-heading toolHeader">
          {"texte chiffé et déchiffré"}
        </div>
        <div className="panel-body">
          <p className="toolDescription">
            Voici le texte chiffré et sous chaque nombre la lettre correspondante selon votre substitution.
          </p>
          <div className="cipherTextBox" ref={refTextBox} onScroll={onScroll} style={{position: 'relative'}}>
            {lines.map(function (line) {
              const {firstCellIndex, lineNumber, cells} = line;
              return (
                <div key={lineNumber} className="cipherTextLine" style={{position: 'absolute', top: `${lineNumber*lineHeight}px`}}>
                  {cells.map(function(cell, iCell) {
                    const isSearched = firstCellIndex + iCell >= searchCursor.first && firstCellIndex + iCell <= searchCursor.last;
                    return <CipherTextCharPair key={iCell} isSearched={isSearched} {...cell} />;
                  })}
                </div>
              );
            })}
            <div style={{position: 'absolute', top: `${bottom}px`, width: '1px', height: '1px'}}/>
          </div>
        </div>
      </div>
    );
  };
});

function extractLines (cells, firstVisibleLine, visibleLines, symbolsPerLine) {
  const lines = [];
  let iCell = firstVisibleLine * symbolsPerLine;
  for (let iLine = 0; iLine < visibleLines; iLine += 1) {
    lines.push({
      firstCellIndex: iCell,
      lineNumber: firstVisibleLine + iLine,
      cells: cells.slice(iCell, iCell + symbolsPerLine)
    });
    iCell += symbolsPerLine;
  }
  return lines;
}
