import React, { Component } from 'react';
import './App.css';
import {connect} from './socket/connection';

class App extends Component {

  render() {
    connect();
    return (
      <div className="App">
      </div>
    );
  }
}

export default App;