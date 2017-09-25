import React, {Component} from 'react';
import fetch from 'isomorphic-fetch';

export default class App extends Component {

  triggerTask() {
    fetch('/invoice-report')
  }

  render() {
    return (
      <div style={{textAlign: 'center', marginTop: '15%'}}>
        <button
          className='btn btn-secondary'
          onClick={() => this.triggerTask()}
        >
          Click Me
        </button>
      </div>
    )
  }
}
