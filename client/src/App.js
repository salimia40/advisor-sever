import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { connect } from './socket/connection';

import { Provider } from 'react-redux';
import store from './store';

class App extends Component {

  render() {
    connect();
    return (
      <Provider store={store}>
        <div className="App">
          hi there
        </div>
      </Provider>
    );
  }
}

export default App;