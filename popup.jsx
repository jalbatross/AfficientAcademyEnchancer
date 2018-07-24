//Run on open
'use strict';

class App extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        quickSubmitEnabled: false
      };
      this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    chrome.storage.sync.get(['quickSubmitEnabled'], function(result) {
          if (result.enabled === undefined) {
              chrome.storage.sync.set({ quickSubmitEnabled: false });
          }
          this.setState({
            quickSubmitEnabled: result.quickSubmitEnabled
          });
          console.log('quickSub: ', this.state.quickSubmitEnabled);
          chrome.storage.sync.set({quickSubmitEnabled: this.state.quickSubmitEnabled});
      }.bind(this));
  }

  handleChange(e) {
    this.setState({ quickSubmitEnabled: e.target.checked },
      function(){
        chrome.storage.sync.set({quickSubmitEnabled: this.state.quickSubmitEnabled});
      });
  }

  render() {
    return (
    <div>
      <h4 className="border border-dark bg-dark">Afficient Academy Enhancer v1.14</h4>
      <input className="form-check-input" type="checkbox" id="quickSubmitDiv" onClick={this.handleChange} checked={this.state.quickSubmitEnabled}/> 
      <label class="form-check-label"> Press Shift+Enter to submit answers </label>
    </div>
    );
  }
}

const popupContainer = document.querySelector('#container');
ReactDOM.render(<App />,popupContainer);
