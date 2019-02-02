import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { connect } from './socket/connection';

import { Provider } from 'react-redux';
import store from './store';
import AppNavBar from './components/AppNavBar';

class App extends Component {

  render() {
    connect();
    return (
      <Provider store={store}>
        <div className="App">
          <AppNavBar></AppNavBar>
        </div>
      </Provider>
    );
  }
}

export default App;