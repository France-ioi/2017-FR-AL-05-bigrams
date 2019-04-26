
import React from '../../node_modules/react/react';
import {Alert, Button} from '../../node_modules/react-bootstrap/lib';
import classnames from '../../node_modules/classnames';
import EpicComponent from '../../node_modules/epic-component/lib';
import {letterToDisplayString, symbolToDisplayString} from '../utils';
import {NUM_BIGRAMS_SEARCH, SYMBOL_DIGITS, COLOR_PALETTE, getBackgroundColor} from '../constants';

const ColorPickerItem = EpicComponent(self => {
  const onClick = function() {
    self.props.onClick(self.props.index);
  };
  self.render = function() {
    const {hue, selected} = self.props;
    const classes = ['color', selected && 'selected'];
    return (
      <span className={classnames(classes)}
        style={{backgroundColor: hue[2]}} onClick={onClick} />);
  };
});

const HighlightTogglePair = EpicComponent(self => {
  const onClick = function() {
    const {index, highlight} = self.props;
    self.props.onClick(index, highlight);
  };
  self.render = function() {
    const {symbol, letter, highlight, isHint} = self.props;
    const classes = ["highlightCharPair", "charPair"];
    const color = getBackgroundColor(highlight, isHint, false);
    return (
      <div className={classnames(classes)} onClick={onClick} style={{backgroundColor: color}}>
        <div className="highlightSymbol pairTop">
          {symbol}
        </div>
        <div className="highlightLetter pairBottom">
          {letter}
        </div>
      </div>
    );
  };
});

export const BigramInput = EpicComponent(self => {
  let input1, input2;
  function refInput1 (element) { input1 = element; }
  function refInput2 (element) { input2 = element; }
  function onKeyPress (event) {
    const {cellSize} = self.props;
    if (event.target === input1 && input1.value.length === cellSize - 1) {
      input2.setSelectionRange(0, cellSize);
      input2.focus();
    }
  }
  function onKeyDown (event) {
    const {cellSize} = self.props;
    if (event.target === input1) {
      if (event.keyCode === 39 && input1.selectionStart === cellSize) {
        input2.setSelectionRange(0, 0);
        input2.focus();
      }
    } else if (event.target === input2) {
      if (event.keyCode === 8 && input2.selectionStart === 0) {
        input1.setSelectionRange(cellSize, cellSize);
        input1.focus();
      } else if (event.keyCode === 37 && input2.selectionStart === 0) {
        input1.setSelectionRange(cellSize, cellSize);
        input1.focus();
      }
    }
  }
  function onChange (event) {
    const value = input1.value + input2.value;
    self.props.onChange(value);
  }
  self.state = {selectionStart: 0, selectionEnd: 0};
  self.render = function() {
    const {value, cellSize, className} = self.props;
    const value1 = value.substr(0, cellSize);
    const value2 = value.substr(cellSize, cellSize);
    return (
      <div className={className}>
        <input type="text" ref={refInput1} onKeyDown={onKeyDown} onKeyPress={onKeyPress} maxLength={cellSize} value={value1} onChange={onChange} />
        <input type="text" ref={refInput2} onKeyDown={onKeyDown} maxLength={cellSize} value={value2} onChange={onChange} />
      </div>
    );
  };
});

export const HighlightBigramSymbol = EpicComponent(self => {
  function onChange (value) {
    self.props.onChange(self.props.index, value);
  }
  self.render = function() {
    const {index, value} = self.props;
    return <BigramInput className="highlightBigramSymbolDiv"
        cellSize={SYMBOL_DIGITS} onChange={onChange} value={value} />;
  };
});


export const HighlightBigramLetter = EpicComponent(self => {
  function onChange (value) {
    self.props.onChange(self.props.index, value);
  }
  self.render = function() {
    const {index, value} = self.props;
    return <BigramInput className="highlightBigramLetterDiv"
        cellSize={1} onChange={onChange} value={value} />;
  };
});

export const Search = EpicComponent(self => {
  const onClickPrevious = function() {
    const {bigrams} = self.props;
    self.props.onClick(false, bigrams);
  };
  const onClickNext = function() {
    const {bigrams} = self.props;
    self.props.onClick(true, bigrams);
  };
  const onChangeFilter = function (event) {
    const value = event.target.checked;
    return self.props.onChangeFilter(value);
  };
  self.render = function() {
    const {filter} = self.props;
    return (
      <div>
        <div className="searchDiv">
          Rechercher :&nbsp;
          <Button onClick={onClickPrevious}>&lt;</Button>
          <Button onClick={onClickNext}>&gt;</Button>
        </div>
        <div className="applyFiltersDiv">
          <label><input type="checkbox" value={filter} onChange={onChangeFilter}/>Filtrer dans l'analyse</label>
        </div>
      </div>
    );
  };
});

export const HighlightAndSearch = EpicComponent(self => {
  const onChangeMode = function (event) {
    self.props.onChangeMode(event.target.value);
  };
  const onChangeFilterSymbols = function (value) {
    self.props.onChangeFilter('symbols', value);
  };
  const onChangeFilterBigrams = function (value) {
    self.props.onChangeFilter('bigrams', value);
  };
  const onChangeSymbolHighlight = function (index, current) {
    const {selectedColorIndex} = self.props;
    const highlight = selectedColorIndex === current ? false : selectedColorIndex;
    self.props.onChangeSymbolHighlight(index, highlight);
  };
  self.render = function() {
    const {filters, substitution, symbolAttrs, highlightedBigramSymbols, highlightedBigramLetters, onBigramSymbolChange, onBigramLetterChange, onClickSearch, selectedColorIndex, onColorPicked, onClearAll} = self.props;
    return (
      <div className="panel panel-default highlightView">
        <div className="panel-heading toolHeader">
          recherche et filtrage
        </div>
        <div className="panel-body">
          <div className="symbolHighlightSearch">
            <p className="toolDescription">{"Cliquez sur une couleur puis des nombres pour colorer toutes leurs occurrences dans le texte et l'analyse :"}</p>
            <div className="higlightPalette">
              {COLOR_PALETTE.map((hue, index) =>
                <ColorPickerItem key={index} index={index} hue={hue} selected={selectedColorIndex == index} onClick={onColorPicked} />)}
              <Button onClick={onClearAll}>Tout déselectionner</Button>
            </div>
            <div className="toolBox">
              <div className="highlightToggleBox">
                {substitution.map(function(target, index) {
                  const symbol = symbolToDisplayString(index);
                  const letter = letterToDisplayString(target.letter);
                  return <HighlightTogglePair key={index}
                    index={index} symbol={symbol} letter={letter}
                    isHint={target.isHint} highlight={target.highlight}
                    onClick={onChangeSymbolHighlight} />;
                })}
              </div>
              <Search onClick={onClickSearch} bigrams={false} filter={filters.symbols} onChangeFilter={onChangeFilterSymbols} />
            </div>
          </div>
          <div className="bigramsHighlightSearch">
            <p className="toolDescription">Entrez jusqu'à {NUM_BIGRAMS_SEARCH} paires de nombres ou de lettres pour colorer leurs occurrences :</p>
            <div className="toolBox">
              <div className="highlightBigramsBox">
                <span className="toolLabel">Paires de nombres :</span>
                {highlightedBigramSymbols.map(function(value, index) {
                  return <HighlightBigramSymbol key={index} index={index} value={value} onChange={onBigramSymbolChange} />
                })}
                <span className="toolLabel">Paires de lettres :</span>
                {highlightedBigramLetters.map(function(value, index) {
                  return <HighlightBigramLetter key={index} index={index} value={value} onChange={onBigramLetterChange} />
                })}
              </div>
              <Search onClick={onClickSearch} bigrams={true} filter={filters.bigrams} onChangeFilter={onChangeFilterBigrams} />
            </div>
          </div>
        </div>
      </div>
    );
  };
});