(async function() {
  "use strict"

  // Universal Variables
  const USERNAME = "cirqlar";

  // Run query
  const query = `
  query {
    user(login: "${USERNAME}") {
      avatarUrl
      name
      followers {
        totalCount
      }
      following {
        totalCount
      }
      bio
      login
      url
      location
      email
      websiteUrl
      starredRepositories {
        totalCount
      }
      status {
        emojiHTML
        message
      }
      repositories(first: 20, orderBy: {field: UPDATED_AT, direction:DESC}) {
        nodes {
          name
          url
          parent {
            nameWithOwner
            url
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

  const attributeBindings = document.querySelectorAll('[data-set]');
  const contentBindings = document.querySelectorAll('[data-set-content]');

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
  const { data: { user } } = await fetch("https://api.github.com/graphql", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 10d0bdc77d482ec54db793323dd384842e2fc860'
    },
    body: JSON.stringify({ query: query }),
  }).then(res => res.json());

  // Update UI
  const getValueFromKeys = (keys) => keys?.split('.').reduce((object, key) => object[key], user);
  const getValueWithPattern = (keys, pattern) => {
    if (pattern) {
      const value = getValueFromKeys(keys);
      return pattern.replace(/%%/gi, value);
    } else {
      return getValueFromKeys(keys)
    }
  }

  attributeBindings.forEach(element => {
    const [attribute, keys] = element.getAttribute('data-set')?.split("=")
    const pattern = element.getAttribute('data-set-pattern')
    const value = getValueWithPattern(keys, pattern);
    if (attribute && value) element.setAttribute(attribute, value);
  });
  
  contentBindings.forEach(element => {
    const keys = element.getAttribute('data-set-content');
    const value = getValueFromKeys(keys);
    element.innerHTML = value ?? element.getAttribute('data-content-fallback');
  })
  

  loadingDiv.classList.add("closed");
  console.log("OMG", user);
})();