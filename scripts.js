(function() {
  "use strict"

  // get elements
  const menuButton = document.querySelector('#menu-button');
  const mobileHeader = document.querySelector('.header-mobile');

  /** 
   * Functions
  */

  // Open and close header
  function toggleHeaderOpen() {
    if (mobileHeader.classList.contains('closed')) {
      mobileHeader.classList.remove('closed');
    } else {
      mobileHeader.classList.add('closed');
    }
  }

  // Add events
  menuButton.addEventListener("click", function(event) {
    event.preventDefault();
    toggleHeaderOpen();
  });
})();