
import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import {letterToDisplayString} from '../utils';
import {getBackgroundColor} from '../constants';

class CipherTextCharPair extends React.PureComponent {
  render () {
    const {symbol, letter, isHint, isLocked, isSearched, highlight, hlSymbol, hlBigramFirst, hlBigramSecond} = this.props;
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
  }
}

export class CipherTextView extends React.PureComponent {

  constructor () {
    super();
    this.textBoxElement = null;
    this.defaultCipherAttrs = {highlight: false};
  }

  state = {
    firstVisibleLine: 0,
    symbolsPerLine: 22,
    lineHeight: 64,
    visibleLines: 6
  };

  refTextBox = (element) => {
    const scrollToPosition = (index) => {
      const lineNumber = Math.trunc(index / this.state.symbolsPerLine);
      element.scrollTop = Math.max(0, lineNumber * this.state.lineHeight - (element.clientHeight / 2));
    };
    this.textBoxElement = element;
    this.setTextBoxInterface(element && {scrollToPosition});
  }

  onScroll = () => {
    const {lineHeight} = this.state;
    const firstVisibleLine = Math.trunc(this.textBoxElement.scrollTop / lineHeight);
    this.setState({firstVisibleLine});
  }

  extractLines (cells, firstVisibleLine, visibleLines, symbolsPerLine) {
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

  setTextBoxInterface = (intf) => {
    this.props.dispatch({type: this.props.setTextBoxInterface, intf});
  }

  render () {
    const {combinedText, searchCursor} = this.props;
    const {firstVisibleLine, symbolsPerLine, lineHeight, visibleLines} = this.state;
    const bottom = (Math.trunc(combinedText.length / symbolsPerLine) + 1) * lineHeight;
    const lines = this.extractLines(combinedText, firstVisibleLine, visibleLines, symbolsPerLine);
    return (
      <div className="panel panel-default cipherTextView">
        <div className="panel-heading toolHeader">
          {"texte chiffé et déchiffré"}
        </div>
        <div className="panel-body">
          <p className="toolDescription">
            Voici le texte chiffré et sous chaque nombre la lettre correspondante selon votre substitution.
          </p>
          <div className="cipherTextBox" ref={this.refTextBox} onScroll={this.onScroll} style={{position: 'relative'}}>
            {lines.map(function (line) {
              const {firstCellIndex, lineNumber, cells} = line;
              return (
                <div key={lineNumber} className="cipherTextLine" style={{position: 'absolute', top: `${lineNumber * lineHeight}px`}}>
                  {cells.map(function (cell, iCell) {
                    const isSearched = firstCellIndex + iCell >= searchCursor.first && firstCellIndex + iCell <= searchCursor.last;
                    return <CipherTextCharPair key={iCell} isSearched={isSearched} {...cell} />;
                  })}
                </div>
              );
            })}
            <div style={{position: 'absolute', top: `${bottom}px`, width: '1px', height: '1px'}} />
          </div>
        </div>
      </div>
    );
  }
}

function CipherTextViewSelector (state) {
  const {combinedText} = state.workspace;
  const {searchCursor} = state.dump;
  const {setTextBoxInterface} = state.actions;

  return {combinedText, searchCursor, setTextBoxInterface};
}

function setTextBoxInterfaceReducer (state, action) {
	return {...state, textBoxInterface: action.intf};
}

export default {
	actions: {
		setTextBoxInterface: 'Workspace.TextBox.SetInterface',
	},
	actionReducers: {
		setTextBoxInterface: setTextBoxInterfaceReducer,
	},
	views: {
		CipherTextView: connect(CipherTextViewSelector)(CipherTextView),
	}
};