
import React from 'react';
import {Button} from 'react-bootstrap';
import classnames from 'classnames';
import {letterToDisplayString, symbolToDisplayString} from '../utils';
import {NUM_BIGRAMS_SEARCH, SYMBOL_DIGITS, COLOR_PALETTE, getBackgroundColor} from '../constants';

class ColorPickerItem extends React.PureComponent {
  onClick = () => {
    this.props.onClick(this.props.index);
  }

  render () {
    const {hue, selected} = this.props;
    const classes = ['color', selected && 'selected'];
    return (
      <span className={classnames(classes)}
        style={{backgroundColor: hue[2]}} onClick={this.onClick} />);
  }
}

class HighlightTogglePair extends React.PureComponent {
  onClick = () => {
    const {index, highlight} = this.props;
    this.props.onClick(index, highlight);
  }

  render () {
    const {symbol, letter, highlight, isHint} = this.props;
    const classes = ["highlightCharPair", "charPair"];
    const color = getBackgroundColor(highlight, isHint, false);
    return (
      <div className={classnames(classes)} onClick={this.onClick} style={{backgroundColor: color}}>
        <div className="highlightSymbol pairTop">
          {symbol}
        </div>
        <div className="highlightLetter pairBottom">
          {letter}
        </div>
      </div>
    );
  }
}
export class BigramInput extends React.PureComponent {
  constructor () {
    super();
    this.input1 = null;
    this.input2 = null;
  }

  onKeyPress = (event) => {
    const {cellSize} = this.props;
    if (event.target === this.input1 && this.input1.value.length === cellSize - 1) {
      this.input2.setSelectionRange(0, cellSize);
      this.input2.focus();
    }
  }

  onKeyDown = (event) => {
    const {cellSize} = this.props;
    if (event.target === this.input1) {
      if (event.keyCode === 39 && this.input1.selectionStart === cellSize) {
        this.input2.setSelectionRange(0, 0);
        this.input2.focus();
      }
    } else if (event.target === this.input2) {
      if (event.keyCode === 8 && this.input2.selectionStart === 0) {
        this.input1.setSelectionRange(cellSize, cellSize);
        this.input1.focus();
      } else if (event.keyCode === 37 && this.input2.selectionStart === 0) {
        this.input1.setSelectionRange(cellSize, cellSize);
        this.input1.focus();
      }
    }
  }

  onChange = () => {
    const value = this.input1.value + this.input2.value;
    this.props.onChange(value);
  }

  refInput1 = (element) => {
    this.input1 = element;
  }

  refInput2 = (element) => {
    this.input2 = element;
  }

  state = {selectionStart: 0, selectionEnd: 0};

  render () {
    const {value, cellSize, className} = this.props;
    const value1 = value.substr(0, cellSize);
    const value2 = value.substr(cellSize, cellSize);
    return (
      <div className={className}>
        <input type="text" ref={this.refInput1} onKeyDown={this.onKeyDown} onKeyPress={this.onKeyPress} maxLength={cellSize} value={value1} onChange={this.onChange} />
        <input type="text" ref={this.refInput2} onKeyDown={this.onKeyDown} maxLength={cellSize} value={value2} onChange={this.onChange} />
      </div>
    );
  }
}

export class HighlightBigramSymbol extends React.PureComponent {
  onChange = (value) => {
    this.props.onChange(this.props.index, value);
  }
  render () {
    const {value} = this.props;
    return <BigramInput className="highlightBigramSymbolDiv"
      cellSize={SYMBOL_DIGITS} onChange={this.onChange} value={value} />;
  }
}

export class HighlightBigramLetter extends React.PureComponent {
  onChange = (value) => {
    this.props.onChange(this.props.index, value);
  }
  render () {
    const {value} = this.props;
    return <BigramInput className="highlightBigramLetterDiv"
      cellSize={1} onChange={this.onChange} value={value} />;
  }
}

export class Search extends React.PureComponent {
  onClickPrevious = () => {
    const {bigrams} = this.props;
    this.props.onClick(false, bigrams);
  }

  onClickNext = () => {
    const {bigrams} = this.props;
    this.props.onClick(true, bigrams);
  }

  onChangeFilter = (event) => {
    const value = event.target.checked;
    return this.props.onChangeFilter(value);
  }

  render () {
    const {filter} = this.props;
    return (
      <div>
        <div className="searchDiv">
          Rechercher :&nbsp;
          <Button onClick={this.onClickPrevious}>&lt;</Button>
          <Button onClick={this.onClickNext}>&gt;</Button>
        </div>
        <div className="applyFiltersDiv">
          <label><input type="checkbox" value={filter} onChange={this.onChangeFilter} />Filtrer dans l'analyse</label>
        </div>
      </div>
    );
  }
}

export class HighlightAndSearch extends React.PureComponent {

  onChangeMode = (event) => {
    this.props.onChangeMode(event.target.value);
  }

  onChangeFilterSymbols = (value) => {
    this.props.onChangeFilter('symbols', value);
  }

  onChangeFilterBigrams = (value) => {
    this.props.onChangeFilter('bigrams', value);
  }

  onChangeSymbolHighlight = (index, current) => {
    const {selectedColorIndex} = this.props;
    const highlight = selectedColorIndex === current ? false : selectedColorIndex;
    this.props.onChangeSymbolHighlight(index, highlight);
  }

  render () {
    const {filters, substitution, highlightedBigramSymbols, highlightedBigramLetters, onBigramSymbolChange, onBigramLetterChange, onClickSearch, selectedColorIndex, onColorPicked, onClearAll} = this.props;
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
                <ColorPickerItem key={index} index={index} hue={hue} selected={selectedColorIndex == index} onClick={this.onColorPicked} />)}
              <Button onClick={this.onClearAll}>Tout déselectionner</Button>
            </div>
            <div className="toolBox">
              <div className="highlightToggleBox">
                {substitution.map((target, index) => {
                  const symbol = symbolToDisplayString(index);
                  const letter = letterToDisplayString(target.letter);
                  return <HighlightTogglePair key={index}
                    index={index} symbol={symbol} letter={letter}
                    isHint={target.isHint} highlight={target.highlight}
                    onClick={this.onChangeSymbolHighlight} />;
                })}
              </div>
              <Search onClick={this.onClickSearch} bigrams={false} filter={filters.symbols} onChangeFilter={this.onChangeFilterSymbols} />
            </div>
          </div>
          <div className="bigramsHighlightSearch">
            <p className="toolDescription">Entrez jusqu'à {NUM_BIGRAMS_SEARCH} paires de nombres ou de lettres pour colorer leurs occurrences :</p>
            <div className="toolBox">
              <div className="highlightBigramsBox">
                <span className="toolLabel">Paires de nombres :</span>
                {highlightedBigramSymbols.map((value, index) => {
                  return <HighlightBigramSymbol key={index} index={index} value={value} onChange={this.onBigramSymbolChange} />;
                })}
                <span className="toolLabel">Paires de lettres :</span>
                {highlightedBigramLetters.map((value, index) => {
                  return <HighlightBigramLetter key={index} index={index} value={value} onChange={this.onBigramLetterChange} />;
                })}
              </div>
              <Search onClick={this.onClickSearch} bigrams={true} filter={filters.bigrams} onChangeFilter={this.onChangeFilterBigrams} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}