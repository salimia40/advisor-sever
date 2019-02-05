import React,{Component} from 'react';
import {Alert} from 'reactstrap';
import {connect} from 'react-redux'
import PropTypes from 'prop-types';

class StatusBar extends Component {

    render() {
        let isError = this.props.statusState.isError;
        let status = this.props.statusState.status;
        console.log(isError);
        return (
            <Alert color={isError ?  'danger':'dark'}>{status}
            </Alert>
        )
    }
}

StatusBar.propTypes = {
    statusState : PropTypes.shape({
        isError: PropTypes.bool.isRequired,
        status: PropTypes.string.isRequired,
    }).isRequired,
}

const mapStateToProps = (state) => ({
    statusState: state.statusState
})

export default connect(mapStateToProps)(StatusBar);
