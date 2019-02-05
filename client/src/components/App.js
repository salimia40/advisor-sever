import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import {connect} from 'react-redux';
import {connectSocket} from '../store/actions';
import AppNavBar from './AppNavBar';
import PropTypes from 'prop-types';
import StatusBar from './StatusBar';

import { Provider } from 'react-redux';
import store from '../store';


class App extends Component {

  connect(){
    if(!this.props.socketState.isError && !this.props.socketState.connected){
      this.props.connectSocket();
    }
  }

  render() {
    this.connect();
    return (
      <Provider store={store}>
        <div className="App">
          <AppNavBar/>
          <StatusBar/>
        </div>
      </Provider>
    );
  }
}

App.propTypes = {
  socketState : PropTypes
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

export default connect(mapStateToProps,mapDispatchToProps)(App);
// export default App;