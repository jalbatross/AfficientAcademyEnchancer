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
    chrome.storage.sync.get(['quickSubmitEnabled'], function (result) {
      console.log('component did mount');
      if (result.enabled === undefined) {
        chrome.storage.sync.set({ quickSubmitEnabled: false });
      }
      this.setState({
        quickSubmitEnabled: result.quickSubmitEnabled
      });
      console.log('quickSub: ', this.state.quickSubmitEnabled);
      chrome.storage.sync.set({ quickSubmitEnabled: this.state.quickSubmitEnabled });
    }.bind(this));
  }

  handleChange(e) {
    console.log('change detected');
    this.setState({ quickSubmitEnabled: e.target.checked }, function () {
      chrome.storage.sync.set({ quickSubmitEnabled: this.state.quickSubmitEnabled });
    });
  }

  render() {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'h4',
        { className: 'border border-dark bg-dark' },
        'Afficient Academy Enhancer v1.14'
      ),
      React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'quickSubmitDiv', onClick: this.handleChange, checked: this.state.quickSubmitEnabled }),
      React.createElement(
        'label',
        { 'class': 'form-check-label' },
        ' Press Shift+Enter to submit answers '
      )
    );
  }
}

const popupContainer = document.querySelector('#container');
ReactDOM.render(React.createElement(App, null), popupContainer);

