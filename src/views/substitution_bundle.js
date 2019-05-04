
import React from 'react';
import {connect} from 'react-redux';
import update from 'immutability-helper';
import {Button} from 'react-bootstrap';
import classnames from 'classnames';
import {symbolToDisplayString, isValidLetter, updateWorkspace} from '../utils';

class SubstitutionEditCharPair extends React.PureComponent {
  onLetterChange = (event) => {
    const {index} = this.props;
    const value = event.target.value.trim().toUpperCase();
    this.props.onChange(index, value);
  }

  onFocus = (event) => {
    event.target.select();
  }

  onSymbolClick = () => {
    this.props.onShowHintRequest(this.props.index);
  }

  onLockClick = () => {
    if (this.props.letter) {
      this.props.onLockSymbol(this.props.index, !this.props.isLocked);
    }
  }

  render () {
    const {symbol, letter, isLocked} = this.props;
    const classes = ['substitutionEditCharPair', 'charPair', isLocked && 'isLocked']
    return (
      <div className={classnames(classes)}>
        <div className="substitutionEditSymbol pairTop clickable" onClick={this.onSymbolClick}>
          {symbol}
        </div>
        <div className="substitutionEditLetter pairBottom">
          {isLocked
            ? <input value={letter} className="substitutionLetterInput" readOnly />
            : <input value={letter} maxLength="1" className="substitutionLetterInput" onChange={this.onLetterChange} onFocus={this.onFocus} onClick={this.onFocus} />}
          <i onClick={this.onLockClick} className={classnames(['fa', isLocked ? 'fa-lock' : 'fa-unlock-alt', !letter && 'lockDisabled'])}></i>
        </div>
      </div>
    );
  }
}

function SubstitutionEditHint ({symbol, letter}) {
  return (
    <div className="substitutionEditCharPair charPair isHint">
      <div className="substitutionEditSymbol pairTop">
        {symbol}
      </div>
      <div className="substitutionEditLetter pairBottom">
        <input value={letter} className="substitutionLetterInput" readOnly />
      </div>
    </div>
  );
}


export class SubstitutionEdit extends React.PureComponent {

  state = {hintRequestData: null};

  renderHintRequest = () => {
    const {hints, baseScore, hintCost} = this.props;
    const {hintRequestData} = this.state;
    const allowHints = true;
    if (!allowHints) {
      <div className="hintsDialog">
        <p><strong>{"Les indices seront bientôt disponibles."}</strong></p>
        <p className="text-center">
          <Button onClick={this.onCloseHintRequest}>{"Annuler"}</Button>
        </p>
      </div>
    }
    const hintsGranted = hints.filter(x => x !== null).length;
    const highestPossibleScore = Math.max(0, baseScore - hintsGranted * hintCost);
    const position = `0${hintRequestData.index}`.slice(-2);
    return (
      <div className="hintsDialog">
        <p><strong>{"Indice demandé : "}</strong>{"Valeur pour la position "}<strong>{position}</strong></p>
        <p><strong>{"Coût : "}</strong> {hintCost}</p>
        <p><strong>{"Score disponible : "}</strong>{highestPossibleScore}</p>
        <p className="text-center">
          <Button onClick={this.onRequestHint}>{"Valider"}</Button>
          <Button onClick={this.onCloseHintRequest}>{"Annuler"}</Button>
        </p>
      </div>
    );
  }

  onRequestHint = () => {
    this.props.dispatch({type: this.props.requestHint, payload: {request: this.state.hintRequestData}});
  }

  onShowHintRequest = (index) => {
    this.setState({hintRequestData: {index}});
  }

  onCloseHintRequest = () => {
    this.setState({hintRequestData: null});
  }

  onSubstitutionChange = (index, letter) => {
    this.props.dispatch({type: this.props.changeSubstitution, index, letter});
  }

  onLockSymbol = (index, value) => {
    this.props.dispatch({type: this.props.lockSymbol, index, value});
  }


  render () {
    const {
      symbolAttrs,
      substitution,
      hints
    } = this.props;
    const {hintRequestData} = this.state;

    return (
      <div className="panel panel-default substitutionView">
        <div className="panel-heading toolHeader">
          substitution et indices
        </div>
        <div className="panel-body">
          {hintRequestData && this.renderHintRequest()}
          <p className="toolDescription">
            Cliquez sous un nombre pour éditer la lettre qui correspond, ou sur le nombre pour l'obtenir en indice.
          </p>
          <div className="substitutionBox">
            {substitution.map((_subObject, index) => {
              const symbol = symbolToDisplayString(index);
              if (hints[index] !== null) {
                return <SubstitutionEditHint key={index} letter={hints[index]} symbol={symbol} />;
              } else {
                const {letter, isLocked} = symbolAttrs[index];
                return <SubstitutionEditCharPair key={index} index={index} symbol={symbol} letter={letter} isLocked={isLocked} onChange={this.onSubstitutionChange} onShowHintRequest={this.onShowHintRequest} onLockSymbol={this.onLockSymbol} />;
              }
            })}
          </div>
        </div>
      </div>
    );
  }
}

function SubstitutionEditSelector (state) {
  const {requestHint, changeSubstitution, lockSymbol} = state.actions;
  const {taskData, dump, workspace} = state;
  const {hints, baseScore, hintCost} = taskData;
  const {symbolAttrs} = dump;
  const {substitution} = workspace;

  return {
    requestHint, changeSubstitution, lockSymbol,
    hints, baseScore, hintCost,
    symbolAttrs, substitution
  };
}



/* changeSubstitution {index, letter} updates the user substitution accordingly. */
function changeSubstitutionReducer (state, action) {
  let {index, letter} = action;
  if (letter === '' || isValidLetter(letter)) {
    const dump = update(state.dump, {
      symbolAttrs: {[index]: {letter: {$set: letter}}}
    });
    return updateWorkspace(state, dump);
  }
  return state;
}

function lockSymbolReducer (state, action) {
  let {index, value} = action;
  const dump = update(state.dump, {
    symbolAttrs: {[index]: {isLocked: {$set: value}}}
  });
  return updateWorkspace(state, dump);
}


export default {
  actions: {
    changeSubstitution: 'Workspace.ChangeSubstitution',
    lockSymbol: 'Workspace.LockSymbol',
  },
  actionReducers: {
    changeSubstitution: changeSubstitutionReducer,
    lockSymbol: lockSymbolReducer,
  },
  views: {
    SubstitutionEdit: connect(SubstitutionEditSelector)(SubstitutionEdit),
  }
};