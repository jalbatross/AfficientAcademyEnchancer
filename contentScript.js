$(function() {
    //---------Constants------
    const STATES = {
        LEARNING: 'learning',
        PROFICIENCY: 'proficiency/afficiency',
        OTHER: 'other'
    }

    Object.freeze(STATES);

    const calcFixScriptId = "calcFixScript";
    const startFixScriptId = "startFixScript";
    var nextFixScriptId = "nextFixScript";

    //Initialize default state to non exercise
    var state = STATES.OTHER;
    var calcFixApplied = false;

    //-------End Constants---------
    
    //-------Class Variables------
    var quickSubmitEnabled = false;

    /**
     * Listener for quickSubmitEnabled and future UI variables
     *
     * Changes the quickSubmitEnabled variable according to its checked status in popup.html
     */
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        quickSubmitEnabled = changes['quickSubmitEnabled'].newValue;
    })

    $(document).keypress(handleQuickSubmitKeypress);

    //--------------------


    //Give an id to the root div, needed to observe mutations to the DOM
    $('div.layout-column').attr('id', 'rootDiv');

    // Select the node that will be observed for mutations
    var targetNode = document.getElementById('rootDiv');

    // Options for the observer (which mutations to observe)
    var config = { childList: true, subtree: true };


    // Callback function to execute when mutations are observed
    var callback = function(mutationsList) {
        //Check for learning session by looking for the id of the divs that
        //house each checkmark icon
        if ($('#item\\.sequence_id').length > 0) {
            if (state !== STATES.LEARNING) {
                state = STATES.LEARNING;
                clearVals();
            }

            //Apply calculator fix if it hasn't been applied yet
            if (!calcFixApplied && !$("[ng-show='calculator&&calculator.grade==6']").hasClass('ng-hide')) {
                    let newScript = document.createElement('script');
                    newScript.setAttribute("id", calcFixScriptId);

                    //Remove "function() {" from the beginning of scriptFunction and the ending "}" from the end of scriptFunction
                    //so that it can be properly used in <script> tags
                    let code = calcFixScriptFunction.toString();
                    let startIndex = code.indexOf("{") + 1;
                    let endIndex = code.lastIndexOf("}");
                    code = code.substring(startIndex, endIndex);
                    newScript.innerHTML = code;

                    //Append to DOM
                    document.body.appendChild(newScript);

                    calcFixApplied = true;
            }
        }
        //Otherwise, check for proficiency/afficiency by looking for proficiency/afficiency timer
        else if ($('#proficiencyTimer').length > 0 ||
            $('#aficiencyTimer').length > 0) {

            if (state !== STATES.PROFICIENCY) {
                clearVals();
                state = STATES.PROFICIENCY;
            }

            //reset calc fix for start screen for proficiency/afficiency
            if ( $('[ng-show="showStartButton"]').length > 0 && !$('[ng-show="showStartButton"]').hasClass('ng-hide')) {
                clearVals();
            }

            //If a calculator appears in this proficiency session and the fix hasn't been applied yet,
            //apply it
            if (!calcFixApplied && !$("[ng-show='calculator&&calculator.grade==6']").hasClass('ng-hide')) {

                let newScript = document.createElement('script');
                newScript.setAttribute("id", calcFixScriptId);

                //Remove "function() {" from the beginning of scriptFunction and the ending "}" from the end of scriptFunction
                //so that it can be properly used in <script> tags
                let code = calcFixScriptFunction.toString();
                let startIndex = code.indexOf("{") + 1;
                let endIndex = code.lastIndexOf("}");
                code = code.substring(startIndex, endIndex);
                newScript.innerHTML = code;

                //Append to DOM
                document.body.appendChild(newScript);

                calcFixApplied = true;

            }
            //Otherwise, not in any problem session
        } 
        else {
            if (state !== STATES.OTHER) {
                clearVals();
                state = STATES.OTHER;
            }
            if ($('[ng-click="go()"]').length > 0) {
                //Remove previous if needed
                if ($("#" + startFixScriptId).length >= 1) {
                    $("#" + startFixScriptId).remove();
                }
                let newScript = document.createElement('script');
                newScript.setAttribute("id", startFixScriptId);

                //Remove "function() {" from the beginning of scriptFunction and the ending "}" from the end of scriptFunction
                //so that it can be properly used in <script> tags

                //TODO: this should be a function
                let code = startButtonFixFunction.toString();
                let startIndex = code.indexOf("{") + 1;
                let endIndex = code.lastIndexOf("}");
                code = code.substring(startIndex, endIndex);
                newScript.innerHTML = code;

                newScript.innerHTML = code;
                //Append to DOM
                document.body.appendChild(newScript);
            }
        }
    };


    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    //-----------End init------
    

    //==========Helper Functions===========
    /**
     * Removes the appended calculator script from the DOM if it has been 
     * appended to it, then sets calcFixApplied to false.
     */
    function clearVals() {
        $("#" + calcFixScriptId).remove();
        calcFixApplied = false;
    }

    /**
     * Handles the quick submit keypress combination (shift + enter)
     *
     * If quick submit is not enabled, does nothing
     * 
     * @param  {keypress} event A keypress event
     */
    function handleQuickSubmitKeypress(event) {
        if (!quickSubmitEnabled) {
            return;
        }
        if ((event.shiftKey ) && (event.keyCode == 13 || event.keyCode == 10)) {
            //Submit answer button for learning
            var submitAnsLearning = $('[ng-show="panelIndex === 2"]').filter('md-card').find('[ng-click="checkAndSubmitBtnLabel === \\\'Next Question\\\' ? nextQuestion():checkAndSubmitBtnLabel === \\\'Next Skill\\\' ? nextSkill():checkAndSubmitAnswer()"]');
            //Submit answer button for proficiency/afficiency
            var submitAnsProficiencyAfficiency= $('[ng-click="checkAndSubmitBtnLabel === \\\'Next Question\\\' ?nextQuestion():checkAndSubmitBtnLabel === \\\'Next Skill\\\' ?nextSkill():checkAndSubmitAnswer()"]');

            if (submitAnsLearning.length !== 0) {
                submitAnsLearning.click();
            }
            if (submitAnsProficiencyAfficiency.length !== 0) {
                submitAnsProficiencyAfficiency.click();
            }
        }
    }
    //======End Helper Functions==========
    

    //===========BEGIN INSERTED SCRIPT FUNCTIONS========== 
    /**
     * Code to be inserted into DOM tagged in <script></script>
     * 
     * Attaches an onClick listener to the homepage start button that
     * disables action until all assignments have been loaded client side.
     */
    var startButtonFixFunction = function() {
        var goBtn = angular.element($('[ng-click="go()"]'))
        var scope = goBtn.scope();

        goBtn.off();
        $(goBtn).click(function() {

            try {
                //Check for to make sure that assignments are loaded, if not then return
                if (scope.regularAssignmentItems == null) {
                    return;
                }

                //Otherwise get started with assignment
                else {
                    scope.go();
                }
            }
            //Only possible error here results from assignment items not being loaded
            //Do nothing in this case
            catch (e) {
                return;
            }
        });

    }

    //Code to be inserted into DOM tagged in <script></script>
    /**
     * Contains numerous fixes to the Afficient Academy calculator functions
     */
    var calcFixScriptFunction = function() {
        //Used for calculator history
        var historyId = 0;
        calcScreen.value = "";
        $("#calcScreen").removeAttr("placeholder");
        $("#calcScreen").css({"font-family":'Helvetica'});
        //Select the calculator equals sign button
        var calcElem = $('#calculator').children()[35];
        var calcScope = angular.element(calcElem).scope();

        calcScope.histDisable = false;

        /**
         * Evaluates calculator inputs using math.js
         * 
         * Accounts for rounding errors by limiting precision at 14 digits.
         */
        calcScope.calcEval = function() {
            //Do nothing if the calc screen input is blank

            if (calcScreen.value === "") {
                calcScope.calcClear();
                return;
            }


            //Do strange % operation (not modulus) if there is a % in the input
            if (-1 !== calcScreen.value.indexOf("%")) {
                calcScope.calcPct();
                return;
            }

            var result = "";
            try {
                result = math.format(math.eval(calcScreen.value), { precision: 14 });

                //Do nothing if evaluation results in no change
                if (result === calcScreen.value) {
                    return;
                }

                historyId++;
                $("#history").append("<li class='list-group-item' id='history-" + historyId + "'>" + calcScreen.value + "</li>");
                calcScreen.value = result;
                $("#history-" + historyId).append(" = " + result);
            } catch (e) {
                console.log('err is: ', e);
                calcScreen.value = "ERROR";
            }
        };

        /**
         * Calculates square root of calculator input using math.js
         * 
         * 14 digits of precision
         */
        calcScope.calcSqrt = function() {
            var intermediaryResult = "";
            var sqrtResult = "";

            try {
                intermediaryResult = math.eval(calcScreen.value);
                sqrtResult = math.format(math.sqrt(intermediaryResult), { precision: 14 });
                historyId++;
                $("#history").append("<li class='list-group-item' id='history-" + historyId + "'>&radic;<span style='text-decoration:overline;'>&nbsp;" + calcScreen.value + "&nbsp;</span></li>");
                calcScreen.value = sqrtResult;
                $("#history-" + historyId).append(" = " + calcScreen.value);
            } catch (e) {
                calcScreen.value = "ERROR";
            }
        }

        /**
         * Calculates cube root of calculator input using math.js
         * 
         * 14 digits of precision
         */
        calcScope.calcCbrt = function() {
            var intermediaryResult = "";
            var cbrtResult = "";

            try {
                intermediaryResult = math.eval(calcScreen.value);
                cbrtResult = math.format(math.cbrt(intermediaryResult), { precision: 14 });
                historyId++;
                $("#history").append("<li class='list-group-item' id='history-" + historyId + "'>&#8731;<span style='text-decoration:overline;'>&nbsp;" + calcScreen.value + "&nbsp;</span></li>");
                calcScreen.value = cbrtResult;
                $("#history-" + historyId).append(" = " + calcScreen.value);
            } catch (e) {
                calcScreen.value = "ERROR";
            }


        }

        /**
         * Squares inputs of calculator using math.js
         * 
         * 14 digits of precision
         */
        angular.element(calcElem).scope().calcSquare = function() {
            var intermediaryResult = "";
            var squaredResult = "";

            try {
                intermediaryResult = math.eval(calcScreen.value);
                squaredResult = math.format(math.pow(intermediaryResult, 2), { precision: 14 });
                historyId++;
                $("#history").append("<li class='list-group-item' id='history-" + historyId + "'>" + calcScreen.value + "<sup>2</sup></li>");
                calcScreen.value = squaredResult;
                $("#history-" + historyId).append(" = " + calcScreen.value);
            } catch (e) {
                calcScreen.value = "ERROR";
            }
        }

        /**
         * calcPct requires three inputs:
         *  Two numbers, which we will call a, b
         *  One operator (+, -, /, *)
         * 
         * For calcPct to correctly parse an input, the input must be of the form:
         *   a OPERATOR b %
         * Where a and b are numbers, OPERATOR is an operator, and % is the % symbol.
         * 
         * Its output evaluates the following:
         *   a OPERATOR (ab/100) 
         * 
         * Or in words, [a] (plus, minus, times, divided by) [b percent of a]
         * 
         * For example, 100 + 5% means
         *   100 + ( (100 * 5) / 100) = 105
         * 
         * Or in words, 100 + (5 percent of 100).
         * 
         */
        angular.element(calcElem).scope().calcPct = function() {
            var arr, sym;

            //count number of operation symbols, if > 1 return error
            var symCount = 0;
            for (let i = 0; i < calcScreen.value.length; i++) {
                if (calcScreen.value.charAt(i) === '+' || calcScreen.value.charAt(i) === '-' ||
                    calcScreen.value.charAt(i) === '*' || calcScreen.value.charAt(i) === '/') {
                    symCount += 1;
                }
            }
            if (symCount > 1) {
                calcScreen.value = "ERROR";
                return;
            }

            //split by symbol
            if (calcScreen.value.indexOf("+") !== -1) {
                arr = calcScreen.value.split("+");
                sym = "+";
            } else if (calcScreen.value.indexOf("-") !== -1) {
                arr = calcScreen.value.split("-");
                sym = "-";
            } else if (calcScreen.value.indexOf("*") !== -1) {
                arr = calcScreen.value.split("*");
                sym = "*";
            } else if (calcScreen.value.indexOf("/") !== -1) {
                arr = calcScreen.value.split("/");
                sym = "/";
            } else {
                calcScreen.value = "ERROR";
            }
            //remove percent symbol from end of input
            arr[1] = arr[1].slice(0, arr[1].length - 1);

            var result = math.format(math.eval(arr[0] + sym + arr[1] * (arr[0] / 100)), { precision: 14 });
            if (isNaN(result)) {
                calcScreen.value = "ERROR";
            } else {
                historyId++;
                $("#history").append("<li class='list-group-item' id='history-" + historyId + "'>" + arr[0] + sym + "(" + arr[1] + "% of " + arr[0] + ")</li>");
                calcScreen.value = result;
                $("#history-" + historyId).append(" = " + calcScreen.value);
            }

        }

        /**
         * Clear the calculator screen
         */
        calcScope.calcClear = function() {
            calcScreen.value = "";
        }

        /**
         * Clear all inputs and calculator history
         */
        calcScope.calcClearAll = function() {
            calcScope.calcClear();
            $("#history").html("");
            historyId = 0;
        }

        /**
         * Clears the calculator if there was an error. Otherwise,
         * removes last character of calc input.
         */
        calcScope.calcBackspace = function() {
            if (calcScreen.value === "ERROR") {
                calcScope.calcClear();
            } else {
                calcScreen.value = calcScreen.value.slice(0, calcScreen.value.length - 1)
            }
        }

        /**
         * Prevents nonnumeral inputs for the calculator
         * 
         */
        $("#calcScreen").keydown(function(event) {
            var key = event.keyCode;
            $('#calcScreen').attr("placeholder","");
            //If the screen is error, the only acceptable keys are delete and backspace
            if (calcScreen.value === "ERROR" && key !== 46 && key !== 8) {
                event.preventDefault;
                return;
            }
            //Clear screen if one of these is pressed
            else if (calcScreen.value === "ERROR" && (key === 46 || key === 8)) {
                calcScope.calcClear();
                return;
            }
            var shift = event.shiftKey;

            if (calcScreen.value === "" && isMathOperatorKey(event, key)) {
                calcScreen.value = '0';
            }

            if (isAlphaOrComma(key)) {
                event.preventDefault();
            }
            //DEL key
            if (key === 46) {
                calcScope.calcClear();
                event.preventDefault();
            }
            //ENTER key
            if (key === 13) {
                calcScope.calcEval();
                event.preventDefault();
            }

        });

        /**
         * Helper function for calcScreen.keyDown
         * Detects if key (or key combination) is a math operator
         * 
         * @param {event}     Keydown event
         * @param {keyCode}   keyCode corresponding to event 
         */
        function isMathOperatorKey(event, key) {
            var shift = event.shiftKey;
            return 107 == key || // +
                109 == key || // subtract
                106 == key || // multiply
                111 == key || // divide
                shift && 54 == key || // ^ (shift and 6)
                shift && 56 == key || // * (shift and 8)
                shift && 187 == key || // + (shift  and equals)
                189 == key; // dash symbol
        }

        /**
         * Helper function for calcScreen.keyDown
         * 
         * Detects if key is a letter or comma
         * @param {keyCode} keyCode corresponding to event
         */
        function isAlphaOrComma(key) {
            return key > 64 && key < 96 || key === 188;

        }
    }

    //=====END INSERTED SCRIPT FUNCTIONS============
});