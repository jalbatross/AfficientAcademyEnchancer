chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

   var scriptOptions = message.scriptOptions;
   var attribute = scriptOptions.param1;
   var badCalcVisible = $("[ng-show='calculator&&calculator.grade==6']").hasClass('ng-hide');
   var htmlElem = $("[ng-show='calculator&&calculator.grade==6']");
   console.log('execute running, calc visibility: ', badCalcVisible);
   console.log('div is: ', htmlElem);

   if (badCalcVisible) {
    console.log('bad calc is active');
    sendResponse('Bad calc is active');
   } 
   else {
   	sendResponse('bad calc is not visible');
   }

});