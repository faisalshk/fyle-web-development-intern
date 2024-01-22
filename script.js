"use strict";

// DOM elements
const input = document.querySelector(".input");
const form = document.querySelector(".form");
const profile = document.querySelector(".profile");
const repository = document.querySelector(".repository");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
const paginationContainer = document.querySelector(".pagination");
const pageContainer = document.querySelector(".pageNumber");
const spinnerUser = document.querySelector(".spinnerUser");
const spinnerRepo = document.querySelector(".spinnerRepo");
const parent = document.querySelector(".parent");

// State variables
let userName = "";
let pageNumber = 1;
let totalPages = 0;
let pageButtons;

// Fetch user data from GitHub API
const getUser = async function (userName) {
  try {
    const res = await fetch(`https://api.github.com/users/${userName}`);
    const userData = await res.json();

    if (res.ok && userData) {
      spinnerUser.style.display = "none";
      updateProfile(userData);
      profile.style.opacity = 1;

      totalPages =
        Math.ceil(userData.public_repos / 10) > 10
          ? 10
          : Math.ceil(userData.public_repos / 10);

      if (totalPages > 1) {
        paginationButtons(totalPages);
        paginationContainer.style.opacity = 1;
      }

      const errorUserDiv = document.querySelector(".error-user");
      errorUserDiv.style.display = "none";
    } else {
      throw new Error("No User Found");
    }
  } catch (err) {
    spinnerRepo.style.display = "none";
    displayError(err);
  }
};

// Fetch user repositories from GitHub API
const getUserRepo = async function (userName, pageNumber = 1) {
  try {
    spinnerRepo.style.display = "flex";
    const res = await fetch(
      `https://api.github.com/users/${userName}/repos?page=${pageNumber}&per_page=10`
    );
    const repoData = await res.json();

    if (res.ok && repoData && repoData.length > 0) {
      spinnerRepo.style.display = "none";
      updateRepository(repoData);

      if (totalPages > 1) updateActivePagination(pageNumber);

      repository.style.opacity = 1;

      const errorRepoDiv = document.querySelector(".error-repo");
      errorRepoDiv.style.display = "none";
    } else {
      throw new Error("No Repository Found");
    }
  } catch (error) {
    spinnerRepo.style.display = "none";
    displayErrorRepo(error);
  }
};

// Display user-related error messages
const displayError = function (error) {
  displayErrorElement(".error-user", error);
  profile.style.opacity = 0;
  paginationContainer.style.opacity = 0;
  spinnerUser.style.display = "none";
};

// Display repository-related error messages
const displayErrorRepo = function (error) {
  displayErrorElement(".error-repo", error);
  repository.style.opacity = 0;
  spinnerRepo.style.display = "none";
};

// Display error message in the specified element
const displayErrorElement = function (elementSelector, error) {
  let el = document.querySelector(elementSelector);
  el.innerHTML = error;
  el.style.display = "block";
};

// Update profile data in the DOM
const updateProfile = function (userData) {
  profile.innerHTML = "";
  let html = `
    <div class="profile-pic">
      <img src="${userData.avatar_url}" alt="Profile Pic" />
    </div>
    <div class="profile-info">
      <h1>${userData.name}</h1>
      <p>${userData.bio}</p>
      <h4><span>Location: </span>${userData.location}</h4>
    </div>
  `;
  profile.insertAdjacentHTML("afterbegin", html);
};

// Update repository data in the DOM
const updateRepository = function (repoData) {
  const repoContainer = document.querySelector(".repository");
  repoContainer.innerHTML = "";

  repoData.forEach((data) => {
    const html = `
      <a class="card" href=${data.html_url} target=_blank>
        <h2>${data.name}</h2>
        <p>${data.description || "No description available"}</p>
        <div class="topic">
          ${
            data.topics.length > 0
              ? data.topics.map((topic) => `<span>${topic}</span>`).join("")
              : "no topics available"
          }
        </div>
      </a>
    `;
    repoContainer.insertAdjacentHTML("afterbegin", html);
  });
};

// Create pagination buttons
const paginationButtons = function (totalPages) {
  pageContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("h4");
    pageBtn.classList.add("pg");
    pageBtn.textContent = i;
    pageBtn.addEventListener("click", pageHandler);
    pageContainer.appendChild(pageBtn);
  }
  pageButtons = document.querySelectorAll(".pg");
};

// Add active class to the pagination buttons
const updateActivePagination = function (activePage) {
  pageButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.innerHTML === activePage.toString()) {
      btn.classList.add("active");
    }
  });
};

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  userName = input.value;
  pageNumber = 1;
  prevBtn.disabled = true;
  nextBtn.disabled = false;
  spinnerUser.style.display = "flex";
  profile.style.opacity = 0;
  repository.style.opacity = 0;

  if (userName) {
    try {
      await getUser(userName);
      getUserRepo(userName);
    } catch (error) {
      console.log(error);
    }

    input.value = "";
  }
});

// Handle pagination button click
const pageHandler = function (e) {
  const page = Number(e.target.innerHTML);
  pageNumber = page;
  repository.style.opacity = 0;

  if (pageNumber === 1) {
    prevBtn.disabled = true;
    nextBtn.disabled = false;
  } else if (pageNumber === totalPages) {
    nextBtn.disabled = true;
    prevBtn.disabled = false;
  } else {
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }

  getUserRepo(userName, page);
};

// Handle previous button click
prevBtn.addEventListener("click", () => {
  pageNumber--;
  repository.style.opacity = 0;
  if (pageNumber === 1) {
    prevBtn.disabled = true;
  }
  nextBtn.disabled = false;
  getUserRepo(userName, pageNumber);
});

// Handle next button click
nextBtn.addEventListener("click", function () {
  pageNumber++;
  repository.style.opacity = 0;
  if (pageNumber === totalPages) {
    nextBtn.disabled = true;
  }
  prevBtn.disabled = false;
  getUserRepo(userName, pageNumber);
});
