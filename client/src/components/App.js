import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'react-image-crop/dist/ReactCrop.css';

import { connect } from 'react-redux';
import { connectSocket } from '../store/actions';

import AppNavBar from './AppNavBar';
import AdressBar from './AdressBar';
import LoginSide from './loginSide';
import PropTypes from 'prop-types';
import StatusBar from './StatusBar';

import { Row, Col, } from 'reactstrap';
import Intro from './views/intro';
import Settings from './views/setting';

class App extends Component {

  connect() {
    if (!this.props.socketState.isError && !this.props.socketState.connected) {
      this.props.connectSocket();
    }
  }

  render() {
    this.connect();
    return (
        <div>
          <AppNavBar />
          <StatusBar />
          <div className='padding'>
            <Row>
              <Col xs="12" md='9'>
                <AdressBar />
                <Intro/>
                <Settings/>
              </Col>
              <Col xs="12" md='3'>
                <LoginSide/>
              </Col>
            </Row>
          </div>
        </div>
    );
  }
}

App.propTypes = {
  socketState: PropTypes
    .shape({
      connected: PropTypes.bool.isRequired,
      isError: PropTypes.bool.isRequired,
    })
    .isRequired,
  connectSocket: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  socketState: state.socketState
})

const mapDispatchToProps = dispatch => {
  return {
    connectSocket: () => {
      dispatch(connectSocket())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
// export default App;