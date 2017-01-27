
import React from 'react';
import {Alert, Button} from 'react-bootstrap';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
import {letterToDisplayString, letterToEditString, symbolToDisplayString} from '../utils';
import {NUM_BIGRAMS_SEARCH, SYMBOL_DIGITS} from '../constants';

const HighlightTogglePair = EpicComponent(self => {
  const onClick = function() {
    self.props.onClick(self.props.index);
  };
  self.render = function() {
    const {symbol, isHighlighted} = self.props;
    return (
      <div className={classnames(["highlightCharPair", "charPair"])}>
        <div className={classnames(["highlightSymbol", isHighlighted && "highlightSynmbolSelected"])} onClick={onClick}>
          {symbol}
        </div>
      </div>
    );
  };
});

export const HighlightBigramSymbol = EpicComponent(self => {
  const onChange = function(event) {
    self.props.onChange(self.props.index, event.target.value);
  }
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
  }
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
  self.render = function() {
    return (
      <div>
        <div className="searchDiv">
          Search in text:
          <br/>
          <Button onClick={onClickPrevious}>Previous</Button>
          <Button onClick={onClickNext}>Next</Button>
        </div>
        <div className="applyFiltersDiv">
          <label><input type="checkbox"/> Apply filter in analysis tool</label>
        </div>
      </div>
    );
  };
});

export const HighlightAndSearch = EpicComponent(self => {
  self.render = function() {
    const {substitution, onHighlightToggle, highlightToggleState, highlightBigrams, onBigramSymbolChange, onBigramLetterChange, onClickSearch} = self.props;
    return (
      <div className="panel panel-default highlightView">
        <div className="panel-heading toolHeader">
          Search and highlighting
        </div>
        <div className="panel-body">
          <p className="toolDescription">{"Highlight or search symbols (click to toggle):"}</p>
          <div className="symbolHighlightSearch">
            <div className="highlightToggleBox">
              {substitution.map(function(subObject, index) {
                const symbol = symbolToDisplayString(index);
                return <HighlightTogglePair key={index} symbol={symbol} index={index} onClick={onHighlightToggle} isHighlighted={highlightToggleState[index]} />;
              })}
            </div>
            <Search onClick={onClickSearch} bigrams={false} />
          </div>
          <div className="bigramsHighlightSearch">
            <div className="highlightBigramsBox">
              <p className="toolDescription">Highlight or search up to {NUM_BIGRAMS_SEARCH} bigrams:</p>
              <span className="toolLabel">By symbols:</span>
              {highlightBigrams.arrays.symbols.map(function(value, index) {
                return <HighlightBigramSymbol key={index} index={index} value={value} onChange={onBigramSymbolChange} />
              })}
              <span className="toolLabel">By decoded letters:</span>
              {highlightBigrams.arrays.letters.map(function(value, index) {
                return <HighlightBigramLetter key={index} index={index} value={value} onChange={onBigramLetterChange} />
              })}
            </div>
            <Search onClick={onClickSearch} bigrams={true} />
          </div>
        </div>
      </div>
    );
  };
});