(async function () {
  "use strict";

  // Set up Username form
  const firstPage = document.querySelector("#first-page");
  const form = document.querySelector("#username-form");
  const formButton = document.querySelector("#username-submit");
  const usernameInput = document.querySelector('input[name="username"]');
  const errors = document.querySelector("#errors");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    firstPage.classList.add("loading");
    formButton.disabled = true;
    formButton.value = "Loading...";
    errors.textContent = "";

    try {
      if (!usernameInput.value) throw new Error("Username is required");
      await generatePage(usernameInput.value);

      firstPage.classList.remove("loading");
      formButton.disabled = false;
      formButton.value = "Search";
    } catch (e) {
      const errorMessage = document.createElement("p");
      errorMessage.textContent = e.message ?? "Somethings gone wrong";
      errors.appendChild(errorMessage);

      firstPage.classList.remove("loading");
      formButton.disabled = false;
      formButton.value = "Search";

      return;
    }

    firstPage.classList.add("closed");
  });

  // Set up menus and dropdowns
  const menuButton = document.querySelector("#menu-button");
  const mobileHeader = document.querySelector(".header-mobile");
  const dropdowns = document.querySelectorAll("details.dropdown-details");

  // Open and close header
  function toggleHeaderOpen() {
    if (mobileHeader.classList.contains("closed")) {
      mobileHeader.classList.remove("closed");
    } else {
      mobileHeader.classList.add("closed");
    }
  }

  // Close dropdowns
  function closeDropDowns(el) {
    for (const dropdown of dropdowns) {
      if (!dropdown.contains(el)) {
        dropdown.removeAttribute("open");
      }
    }
  }

  // Add events
  menuButton.addEventListener("click", function (event) {
    event.preventDefault();
    toggleHeaderOpen();
  });

  document.addEventListener("click", function (event) {
    closeDropDowns(event.target);
  });

  async function generatePage(username) {
    // Run query
    const query = `
  query {
    user(login: "${username}") {
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
      starredRepositories {
        totalCount
      }
      status {
        emojiHTML
        message
      }
      repositories(first: 20, orderBy: {field: PUSHED_AT, direction:DESC}, ownerAffiliations: [OWNER]) {
        totalCount
        nodes {
          name
          url
          parent {
            nameWithOwner
            url
            forkCount
          }
          pushedAt
          primaryLanguage {
            color
            name
          }
          shortDescriptionHTML
          isArchived
          forkCount
          stargazerCount
          repositoryTopics(first: 4) {
            nodes {
              topic {
                name
              }
              url
            }
          }
        }
      }
    }
  }
  `;

    // Set up profile card scroll listener
    const stickyProfile = document.querySelector("#sticky-profile");
    let scrollTop = 0;

    window.addEventListener("scroll", (event) => {
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    });

    setInterval(() => {
      if (scrollTop >= 270) {
        stickyProfile.classList.add("is-shown");
      } else {
        stickyProfile.classList.remove("is-shown");
      }
    }, 100);

    // Call Query
    const {
      data: { user },
    } = await fetch("https://cirqlar-bc-test.herokuapp.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query }),
    }).then((res) => res.json());

    if (!user) {
      throw new Error("User not found");
    }

    // Update UI
    const getValueFromKeys = (keys) => keys?.split(".").reduce((object, key) => object[key] ?? {}, user);
    const getValueWithPattern = (keys, pattern) => {
      if (pattern) {
        const value = getValueFromKeys(keys);
        return pattern.replace(/%%/gi, value);
      } else {
        return getValueFromKeys(keys);
      }
    };

    // Add attribute bindings
    const attributeBindings = document.querySelectorAll("[data-set]");
    attributeBindings.forEach((element) => {
      const [attribute, keys] = element.getAttribute("data-set")?.split("=");
      const pattern = element.getAttribute("data-set-pattern");
      let value = getValueWithPattern(keys, pattern);
      if (typeof value === "object") value = null;
      if (attribute && value) element.setAttribute(attribute, value);
    });

    // Add content bindings
    const contentBindings = document.querySelectorAll("[data-set-content]");
    contentBindings.forEach((element) => {
      const keys = element.getAttribute("data-set-content");
      let value = getValueFromKeys(keys);
      if (typeof value === "object") value = null;
      element.innerHTML = value ?? element.getAttribute("data-content-fallback");
    });

    // Build repositories list
    const reposList = document.querySelector("#repos-list");
    user?.repositories?.nodes?.forEach((repo) => {
      // Generate repo info node
      const repoInfo = document.createElement("div");
      repoInfo.classList.add("repo-info");

      // Generate and append repository name
      const repoLink = document.createElement("a");
      repoLink.href = repo.url;
      repoLink.textContent = repo.name;

      const repoH3 = document.createElement("h3");
      repoH3.appendChild(repoLink);
      if (repo.isArchived) {
        const repoLabel = document.createElement("span");
        repoLabel.classList.add("repo-label");
        repoLabel.textContent = "Archived";
        repoH3.append(" ");
        repoH3.appendChild(repoLabel);
      }

      const repoName = document.createElement("div");
      repoName.classList.add("repo-name");
      repoName.appendChild(repoH3);

      if (repo.parent) {
        const forkedLink = document.createElement("a");
        forkedLink.href = repo.parent.url;
        forkedLink.textContent = repo.parent.nameWithOwner;

        const forkedRepo = document.createElement("div");
        forkedRepo.classList.add("repo-forked");
        forkedRepo.textContent = "Forked from ";
        forkedRepo.appendChild(forkedLink);

        repoName.appendChild(forkedRepo);
      }
      repoInfo.appendChild(repoName);

      // Generate and append bio node
      if (repo.shortDescriptionHTML) {
        const bioParagraph = document.createElement("p");
        bioParagraph.innerHTML = repo.shortDescriptionHTML;

        const bio = document.createElement("div");
        bio.classList.add("repo-bio");
        bio.appendChild(bioParagraph);

        repoInfo.appendChild(bio);
      }

      // Generate and append topics
      if (repo.repositoryTopics.nodes.length > 0) {
        const repoTags = document.createElement("div");
        repoTags.classList.add("repo-tags");

        repo.repositoryTopics.nodes.forEach((tag) => {
          const topicLink = document.createElement("a");
          topicLink.href = tag.url;
          topicLink.textContent = tag.topic.name;

          repoTags.appendChild(topicLink);
        });

        repoInfo.appendChild(repoTags);
      }

      // generate and append footer
      const repoFooter = document.createElement("div");
      repoFooter.classList.add("repo-footer");

      if (repo.primaryLanguage) {
        const colorSpan = document.createElement("span");
        colorSpan.classList.add("lang-color");
        colorSpan.style.backgroundColor = repo.primaryLanguage.color;
        const nameSpan = document.createElement("span");
        nameSpan.classList.add("lang-name");
        nameSpan.textContent = repo.primaryLanguage.name;

        const langSpan = document.createElement("span");
        langSpan.classList.add("repo-lang");
        langSpan.append(colorSpan, " ", nameSpan);

        repoFooter.appendChild(langSpan);
      }

      if (repo.forkCount > 0 || repo.parent?.forkCount > 0) {
        const forkLink = document.createElement("a");
        forkLink.classList.add("repo-forks");
        forkLink.href = repo.url + "/network/members";
        forkLink.innerHTML = `
<svg aria-label="fork" role="img" viewBox="0 0 16 16" height="16" width="16" class="">
  <path
    fill-rule="evenodd"
    d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"
  ></path>
</svg>
      `;
        forkLink.append(repo.forkCount || repo.parent.forkCount);
        repoFooter.appendChild(forkLink);
      }

      if (repo.stargazerCount > 0) {
        const starLink = document.createElement("a");
        starLink.classList.add("repo-stars");
        starLink.href = repo.url + "/stargazers";
        starLink.innerHTML = `
<svg aria-label="star" role="img" viewBox="0 0 16 16" height="16" width="16" class="">
  <path
    fill-rule="evenodd"
    d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"
  ></path>
</svg
      `;
        starLink.append(" ", repo.stargazerCount);
        repoFooter.appendChild(starLink);
      }

      const repoUpdated = document.createElement("span");
      repoUpdated.classList.add("repo-updated");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const date = new Date(repo.pushedAt);
      const thisYear = date.getFullYear() === new Date().getFullYear();
      const updatedAt = `Updated on ${date.getDate()} ${months[date.getMonth()]}${
        thisYear ? "" : ", " + date.getFullYear()
      }`;
      repoUpdated.textContent = updatedAt;

      repoFooter.appendChild(repoUpdated);

      repoInfo.appendChild(repoFooter);

      const starButton = document.createElement("button");
      starButton.classList.add("btn");
      starButton.classList.add("btn-sm");
      starButton.innerHTML = `
<svg class="" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
  <path
    fill-rule="evenodd"
    d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"
  ></path>
</svg>
Star
    `;
      const repoButton = document.createElement("div");
      repoButton.classList.add("repo-button");
      repoButton.appendChild(starButton);

      const repoLi = document.createElement("li");
      repoLi.classList.add("repo");
      repoLi.appendChild(repoInfo);
      repoLi.appendChild(repoButton);

      reposList.appendChild(repoLi);
    });
  }
})();
