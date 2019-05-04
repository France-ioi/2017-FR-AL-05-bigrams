import React from 'react';
import {connect} from 'react-redux';

class Workspace extends React.PureComponent {
	render () {
	  const {
		Analysis,
		CipherTextView,
		HighlightAndSearch,
		SubstitutionEdit
	  } = this.props;

	  return (
		<div className="taskWrapper">
		  <SubstitutionEdit/>
		  <CipherTextView/>
		  <HighlightAndSearch/>
		  <Analysis/>
		</div>
	  );
	}
  }


/* The 'Workspace' view displays the main task view to the contestant. */
function WorkspaceSelector (state, props) {
	return {...state.views};
}

export default {
	views: {
		Workspace: connect(WorkspaceSelector)(Workspace),
	}
};