
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
import {letterToDisplayString, symbolToDisplayString} from '../utils';
import {NUM_BIGRAMS_SEARCH, SYMBOL_DIGITS} from '../constants';

const HighlightTogglePair = EpicComponent(self => {
  const onClick = function() {
    self.props.onClick(self.props.index);
  };
  self.render = function() {
    const {symbol, letter, isHighlighted, isHint} = self.props;
    const classes = [
      "highlightCharPair", "charPair",
      isHighlighted && "highlightCharPairSelected",
      isHint && "isHint"
    ];
    return (
      <div className={classnames(classes)} onClick={onClick}>
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
          Search in text:
          <br/>
          <Button onClick={onClickPrevious}>Previous</Button>
          <Button onClick={onClickNext}>Next</Button>
        </div>
        <div className="applyFiltersDiv">
          <label><input type="checkbox" value={filter} onChange={onChangeFilter}/> Apply filter in analysis tool</label>
        </div>
      </div>
    );
  };
});

export const HighlightAndSearch = EpicComponent(self => {
  const onChangeFilterSymbols = function (value) {
    self.props.onChangeFilter('symbols', value);
  };
  const onChangeFilterBigrams = function (value) {
    self.props.onChangeFilter('bigrams', value);
  };
  self.render = function() {
    const {filters, substitution, symbolAttrs, highlightedBigramSymbols, highlightedBigramLetters, onHighlightToggle, onBigramSymbolChange, onBigramLetterChange, onClickSearch} = self.props;
    return (
      <div className="panel panel-default highlightView">
        <div className="panel-heading toolHeader">
          Search and highlighting
        </div>
        <div className="panel-body">
          <div className="symbolHighlightSearch">
            <p className="toolDescription">{"Highlight or search symbols (click to toggle):"}</p>
            <div className="higlightPalette">
              <span className="color" style={{backgroundColor: "#e6c319"}}></span>
              <span className="color selected" style={{backgroundColor: "#19c7e6"}}></span>
              <span className="color" style={{backgroundColor: "#3fe619"}}></span>
              <Button>Tout déselectionner</Button>
            </div>
            <div className="toolBox">
              <div className="highlightToggleBox">
                {substitution.map(function(target, index) {
                  const symbol = symbolToDisplayString(index);
                  const letter = letterToDisplayString(target.letter);
                  return <HighlightTogglePair key={index}
                    index={index} symbol={symbol} letter={letter}
                    isHint={target.isHint} isHighlighted={target.isHighlighted}
                    onClick={onHighlightToggle} />;
                })}
              </div>
              <Search onClick={onClickSearch} bigrams={false} filter={filters.symbols} onChangeFilter={onChangeFilterSymbols} />
            </div>
          </div>
          <div className="bigramsHighlightSearch">
            <p className="toolDescription">Highlight or search up to {NUM_BIGRAMS_SEARCH} bigrams:</p>
            <div className="toolBox">
              <div className="highlightBigramsBox">
                <span className="toolLabel">By symbols:</span>
                {highlightedBigramSymbols.map(function(value, index) {
                  return <HighlightBigramSymbol key={index} index={index} value={value} onChange={onBigramSymbolChange} />
                })}
                <span className="toolLabel">By decoded letters:</span>
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