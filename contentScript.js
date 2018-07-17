$(function () {
    console.log('Content script started');
    if(typeof angular == 'undefined') {
        //alert('angular not working  for extension');
    }
    else {
        //alert('angular working');
    }

    const STATES = {
        LEARNING: 'learning',
        PROFICIENCY: 'proficiency/afficiency',
        OTHER: 'other'
    }
    Object.freeze(STATES);

    var state = STATES.OTHER;
    var myAlert = "";
    var calcActive = false;

    //Give an id to the root div, needed to observe mutations to the SPA DOM
    $('div.layout-column').attr('id', 'rootDiv');

    // Select the node that will be observed for mutations
    var targetNode = document.getElementById('rootDiv');

    // Options for the observer (which mutations to observe)
    var config = {childList: true, subtree: true };


    // Callback function to execute when mutations are observed
    var callback = function (mutationsList) {
        //Check for learning session by looking for the id of the divs that
        //house each checkmark icon
        if ($('#item\\.sequence_id').length > 0) {
            console.log('in learning session');

            
            if (state !== STATES.LEARNING) {
                myAlert = 'current state is: ' +  state + ' and changing to '+ STATES.LEARNING;
                //alert(myAlert);
                state = STATES.LEARNING;
                calcActive = false;
                //clearVals();
            }
            else {
                //If a calculator appears in this learning session, apply fix
                if (!calcActive && !$("[ng-show='calculator&&calculator.grade==6']").hasClass('ng-hide')) {
                    //alert('detected active calculator in learning session! attaching fix to calc popup button click...');
                    calcActive = true;
                    
                    $("[ng-click='popCalculatorG6($event)']").click(function () {
                        let newScript = document.createElement('script');
                        newScript.setAttribute("id", 'extensionScript');
                        let scriptFunction = function() {
                            var historyId = 0;
                            var calcElem = $('#calculator').children()[35];

                            var calcScope = angular.element(calcElem).scope();

                            angular.element(calcElem).scope().calcEval = function () {
                                if (calcScreen.value == "") {
                                    calcScreen.value = $("#calcScreen").attr("placeholder");

                                    //Do nothing if the calc screen input is blank
                                    return;
                                }
                                if (-1 !== calcScreen.value.indexOf("%")) {
                                    calcScope.calcPct();
                                    return;
                                }
                                if (isNaN(eval(calcScreen.value))) {
                                    calcScreen.value = "ERROR";
                                }
                                else {
                                    historyId++;
                                    $("#history").append("<li class='list-group-item' id='history-" + historyId + "'>" + calcScreen.value + "</li>");
                                    result = math.format(math.eval(calcScreen.value), { precision: 14 });
                                    $("#calcScreen").val("").attr("placeholder", result);
                                    $("#history-" + historyId).append(" = " + result);
                                    //scope.histDisable = false;
                                }

                            };

                            angular.element(calcElem).scope().calcSqrt = function () {
                                var result = math.eval(calcScreen.value);
                                if (isNaN(math.sqrt(result))) {
                                    calcScreen.value = "ERROR";
                                }
                                else {
                                    historyId++;
                                    $("#history").append("<li class='list-group-item' id='history-" + historyId + "'>&radic;<span style='text-decoration:overline;'>&nbsp;" + calcScreen.value + "&nbsp;</span></li>");
                                    calcScreen.value = math.format(math.sqrt(result), { precision: 14 });
                                    $("#history-" + historyId).append(" = " + calcScreen.value);
                                }


                            }

                            angular.element(calcElem).scope().calcCbrt = function () {
                                var result = math.eval(calcScreen.value);
                                if (isNaN(math.cbrt(result))) {
                                    calcScreen.value = "ERROR";
                                }
                                else {
                                    historyId++;
                                    $("#history").append("<li class='list-group-item' id='history-" + historyId + "'>&#8731;<span style='text-decoration:overline;'>&nbsp;" + calcScreen.value + "&nbsp;</span></li>");
                                    calcScreen.value = math.format(math.cbrt(result), { precision: 14 });
                                    $("#history-" + historyId).append(" = " + calcScreen.value);
                                }


                            }

                            angular.element(calcElem).scope().calcSquare = function () {
                                var result = math.eval(calcScreen.value);
                                if (isNaN(math.pow(result, 2))) {
                                    calcScreen.value = "ERROR";
                                }
                                else {
                                    historyId++;
                                    $("#history").append("<li class='list-group-item' id='history-" + historyId + "'>" + calcScreen.value + "<sup>2</sup></li>");
                                    calcScreen.value = math.format(math.pow(result,2), { precision: 14 });
                                    $("#history-" + historyId).append(" = " + calcScreen.value);
                                }
                            }

                            angular.element(calcElem).scope().calcPct = function() {
                                var arr, sym;
                    
                                //count number of operation symbols, if > 1 return error
                                var symCount = 0;
                                for (let i = 0; i < calcScreen.value.length; i++) {
                                    if (calcScreen.value.charAt(i) === '+' || calcScreen.value.charAt(i) === '-'
                                        || calcScreen.value.charAt(i) === '*' || calcScreen.value.charAt(i) === '/') {
                                            symCount +=1 ;
                                        }
                                }
                                if (symCount > 1) {
                                    calcScreen.value = "ERROR";
                                    return;
                                }
                    
                                //split by symbol
                                if (calcScreen.value.indexOf("+") !== - 1) {
                                    arr = calcScreen.value.split("+");
                                    sym = "+";
                                }
                                else if (calcScreen.value.indexOf("-") !== -1) {
                                    arr = calcScreen.value.split("-");
                                    sym = "-";
                                }
                                else if (calcScreen.value.indexOf("*") !== - 1) {
                                    arr = calcScreen.value.split("*");
                                    sym = "*";
                                }
                                else if (calcScreen.value.indexOf("/") !== -1) {
                                    arr = calcScreen.value.split("/");
                                    sym = "/";
                                }
                                else {
                                    calcScreen.value = "ERROR";
                                }
                                //remove percent symbol from end of input
                                arr[1] = arr[1].slice(0, arr[1].length - 1);
                    
                                var result = math.format( math.eval(arr[0] + sym + arr[1] * (arr[0] / 100)), {precision:14} );
                                if (isNaN(result)) {
                                    calcScreen.value = "ERROR";
                                }
                                else {
                                    historyId++;
                                    $("#history").append("<li class='list-group-item' id='history-" + historyId + "'>" + arr[0] + sym + "("+arr[1]+"% of " + arr[0] + ")</li>");
                                    calcScreen.value = result;
                                    $("#history-" + historyId).append(" = " + calcScreen.value);
                                }
                                
                            }

                            $("#calcScreen").keydown(function(event) {
                                console.log('keydown detected with code ' , event.keyCode);
                                console.log('current calcscreen val is: ', calcScreen.value);   
                                var key = event.keyCode;
                                "ERROR" == calcScreen.value && 46 != key && event.preventDefault();
                                var shift = event.shiftKey;
                                "" == calcScreen.value && (107 == key || 109 == key || 106 == key || 111 == key || shift && 54 == key || shift && 56 == key || shift && 187 == key || 189 == key) && (calcScreen.value = $("#calcScreen").attr("placeholder")),
                                (key > 64 && key < 96 || 188 == key) && event.preventDefault(),
                                46 === key && (calcScreen.value = ""),
                                13 === key ? (angular.element(calcElem).scope().calcEval(),
                                event.preventDefault()) : $("#calcScreen").attr("placeholder", 0)
                            })
                        }
                        newScript.innerHTML = scriptFunction.toString().substring(12, scriptFunction.toString().length - 1);;
                        console.log(newScript);
                        document.head.appendChild(newScript);
                        
                    });


                    
                } 
            
            
            }
            
            
        }
        //Otherwise, check for proficiency/afficiency by looking for the id of
        //the div housing all checkmark icons for proficiency/afficiency only
        else if ($('#statusIconsRow').length > 0) {
            console.log('in proficiency or afficiency');
            if (state !== STATES.PROFICIENCY) {
                calcActive =false;
                myAlert = 'current state is: ' +  state + ' and changing to '+ STATES.PROFICIENCY;
                //alert(myAlert);
            }
            state = STATES.PROFICIENCY;
        }
        else {
            console.log('not in any problem session');
            if (state !== STATES.OTHER) {
                calcActive = false;
                myAlert = 'current state is: ' +  state + ' and changing to '+ STATES.OTHER;
                //alert(myAlert);
            }
            state = STATES.OTHER;
        }

        if ($("[ng-show='calculator&&calculator.grade==6']").hasClass('ng-hide')) {
            console.log('g6 calc hidden');
        }
        else if ($("[ng-show='currentExercise.calculator&&currentExercise.calculator.grade==6']").hasClass('ng-hide')) {
            console.log('g6 calc hidden  (proficiency/afficiency)');
        }
        else {
            console.log('g6 calc exposed');
        }
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

});

