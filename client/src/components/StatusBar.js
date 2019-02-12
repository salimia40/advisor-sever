import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import './App.css';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

class StatusBar extends Component {

    render() {
        let isError = this.props.statusState.isError;
        let status = this.props.statusState.status;
        return (
            <TransitionGroup>
                {status !== '' &&
                    <CSSTransition key={'status'+status} timeout={3000} classNames='statusOpacity'>
                        <div className={isError ? 'danger' : 'dark'} >{status}
                        </div>
                    </CSSTransition>}
            </TransitionGroup>
        )
    }
}

StatusBar.propTypes = {
    statusState: PropTypes.shape({
        isError: PropTypes.bool.isRequired,
        status: PropTypes.string.isRequired,
    }).isRequired,
}

const mapStateToProps = (state) => ({
    statusState: state.statusState
})

export default connect(mapStateToProps)(StatusBar);
