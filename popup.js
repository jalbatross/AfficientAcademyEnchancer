//Run on open
document.addEventListener('DOMContentLoaded', () => {

  chrome.storage.sync.get(['enabled'], function(result) {
    //if result has not been set yet, default to enabled
    if(Object.keys(result).length === 0 && result.constructor === Object) {
      chrome.storage.sync.set({'enabled': false});
    }

    if (result.enabled) {
      message.innerHTML = "Enhancer disabled";
      chrome.storage.sync.set({'enabled': false});
    }
    else {
      message.innerHTML = "Enhancer enabled";
      chrome.storage.sync.set({'enabled': true});
    }
  })


  chrome.tabs.executeScript(null, {file: "/lib/jquery-3.2.1.min.js"}, function() {
    chrome.tabs.executeScript({file: "background.js"});
  });
  
  chrome.browserAction.onClicked.addListener(function(tab) {
    alert('clicked');
  })


});