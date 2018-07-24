1.14
----
* Added a quick submit shortcut (Shift+Enter) for problem sets. This setting can be toggled in the updated popup.html
* Reworked popup.html:
  1. popup.html now rendered using a [React.js template](/popup.jsx)
  2. popup.html contains the most recent version of the extension
  3. Added a toggle for quick submit functionality in popup.html
* Removed calculator placeholders; clearing the calculator screen clears it completely instead of leaving a 0 
  placeholder. Students were spending unneccessary time and concern trying to get rid of the placeholder for 
  basic calculations.
* Fixed a memory leak with the calculator fix script. Before, clicking on the calculator popup button appended 
  a new script to the DOM head every time which caused seemed to be a cause of issues and delayed performance for
  users. The calculator fix is now applied upon entering any problem set with a calculator and is no longer 
  dependent on whether or not the user clicks on the calculator popup button.
* Fixed a bug where the calculator would not be applied for successive proficiency/afficiency sessions.
* Additional documentation and organization of the [content script](/contentScript.js).
* Deleted some unnecessary files and added Node modules for Babel + React.

1.13
----
* Working cross platform implementation of Start button fix. Previous version fixed the memory leak but since the script
was only added to the DOM once, changing the page would cause the previously applied script to lose targets. Now,
the extension checks for the existence of any previous script tags with the correct id, removes them, and adds
the script back to the DOM again.

1.12
----
* Fixed a memory leak with the start button fix by having the extension check for the existence of script tags
with the id startButtonFix before appending the fix script to the DOM. 
