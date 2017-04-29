/**
 * Created by paulbarrass on 29/04/2017.
 */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {uiUpdate} from 'redux/modules/ui';

class TextInput extends Component {
	static propTypes = {
		uiKey: PropTypes.string.isRequired,
		onEnterPressed: PropTypes.func,
		updateText: PropTypes.func,
		text: PropTypes.string
	};

	onChange = (evt) => {
		this.props.updateText(evt.target.value);
	};

	onKeyDown = (evt) => {
		const {onEnterPressed, text, updateText} = this.props;
		// detect enter press
		if (onEnterPressed && evt.keyCode === 13) {
			onEnterPressed(text);
			updateText('');
		}
	};

	render() {
		const {text} = this.props;
		return (
			<input type='text'
				   value={text || ''}
				   onChange={this.onChange}
				   onKeyDown={this.onKeyDown}/>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	text: state.ui[ownProps.uiKey]
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	updateText: (text) => {
		dispatch(uiUpdate({key: ownProps.uiKey, newState: text}));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(TextInput);

