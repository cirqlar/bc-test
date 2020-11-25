(async function() {
  "use strict"

  // Run query
  const query = `
  query {
    user(login: "cirqlar") {
      avatarUrl
      repositories(first: 20, orderBy: {field: UPDATED_AT, direction:DESC}) {
        nodes {
          name
          parent {
            nameWithOwner
          }
          updatedAt
          primaryLanguage {
            color
            name
          }
          shortDescriptionHTML
          isPrivate
          isArchived
          forkCount
          stargazerCount
          licenseInfo {
            name
          }
        }
      }
    }
  }
  `

  // get elements
  const loadingDiv = document.querySelector('.loading');
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

  // Call Query
  const result = await fetch("https://api.github.com/graphql", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 10d0bdc77d482ec54db793323dd384842e2fc860'
    },
    body: JSON.stringify({ query: query }),
  }).then(res => res.json());

  loadingDiv.classList.add("closed");
  console.log("OMG", result);
})();