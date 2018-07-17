var badCalcVisible = $("[ng-show='calculator&&calculator.grade==6']").hasClass('ng-hide');
var calcText = badCalcVisible ? "calc hidden" : "calc not hidden";
setTimeout(function() {console.log("checking for calc"); }, 2000);

chrome.storage.sync.get(['enabled'], function (result) {
    if (result.enabled) {
        setIconEnabled();
    }
    else {
        setIconDisabled();
    }
});
function setIconEnabled() {
    console.log('enabled ', calcText);
}

function setIconDisabled() {
    console.log('disabled ', calcText);
}

chrome.webRequest.onResponseStarted.addListener(function(response){console.log('response! ',response )});