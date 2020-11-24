(function() {
  "use strict"

  // get elements
  const menuButton = document.querySelector('#menu-button');
  const mobileHeader = document.querySelector('.header-mobile');
  const dropdowns = document.querySelectorAll('details.dropdown-details');

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

  // Close dropdowns
  function closeDropDowns(el) {
    for (const dropdown of dropdowns) {
      if (!dropdown.contains(el)) {
        dropdown.removeAttribute('open');
      }
    }
  }

  // Add events
  menuButton.addEventListener("click", function(event) {
    event.preventDefault();
    toggleHeaderOpen();
  });

  document.addEventListener("click", function(event) {
    
    closeDropDowns(event.target);
  })
})();