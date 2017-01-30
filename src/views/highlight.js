
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
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
        style={{backgroundColor: hue[1]}} onClick={onClick} />);
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

export const HighlightBigramSymbol = EpicComponent(self => {
  const onChange = function(event) {
    self.props.onChange(self.props.index, event.target.value);
  };
  self.render = function() {
    const {index, value} = self.props;
    return (
      <div className="highlightBigramSymbolDiv">
        <input type="text" maxLength={2 * SYMBOL_DIGITS} value={value} onChange={onChange} />
      </div>
    );
  };
});

export const HighlightBigramLetter = EpicComponent(self => {
  const onChange = function(event) {
    self.props.onChange(self.props.index, event.target.value);
  };
  self.render = function() {
    const {index, value} = self.props;
    return (
      <div className="highlightBigramLetterDiv">
        <input type="text" maxLength="2" value={value} onChange={onChange} />
      </div>
    );
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
    const {filters, substitution, symbolAttrs, highlightedBigramSymbols, highlightedBigramLetters, onBigramSymbolChange, onBigramLetterChange, onClickSearch, selectedColorIndex, onColorPicked} = self.props;
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
              <Button>Tout déselectionner</Button>
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