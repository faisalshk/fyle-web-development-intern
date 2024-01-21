"use strict";
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

const formRepo = document.querySelector(".form-repo");
const formRepoinput = document.querySelector(".form-repo .input");

let pageButtons;
let userName = "";
let pageNumber = 1;
let totalPages = 0;
//////////////////////////////////////////////////////////////////////////////
const getUser = async function (userName) {
  try {
    const fetchData = fetch(`https://api.github.com/users/${userName}`);
    const res = await fetchData;
    const userData = await res.json();

    // Log the data to the console
    console.log(userData);

    if (res.ok && userData) {
      spinnerUser.style.display = "none";
      // Update the profile data in the DOM
      updateProfile(userData);

      profile.style.opacity = 1;

      totalPages =
        Math.ceil(userData.public_repos / 10) > 10
          ? 10
          : Math.ceil(userData.public_repos / 10);

      console.log(totalPages);

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

///////////////////////////////////////////////////////////////////////////////
const getUserRepo = async function (userName, pageNumber = 1) {
  console.log(totalPages);
  try {
    spinnerRepo.style.display = "flex";
    const fetchRepoData = fetch(
      `https://api.github.com/users/${userName}/repos?page=${pageNumber}&per_page=10`
    );

    const res = await fetchRepoData;

    const repoData = await res.json();

    console.log(repoData);

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

////////////////////////////////////////////////////////////////////////////
// const getRepoByName = async function (repoName) {
//   try {
//     const fetchRepo = fetch(`git://github.com/johnpapa/${repoName}.git`);
//     const res = await fetchRepo;
//     const data = res.json();
//     if (res.ok) {
//       console.log(data);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

//////////////////////////////////////////////////////////////////////////
const displayError = function (error) {
  let el = document.querySelector(".error-user");
  el.innerHTML = error;
  el.style.display = "block";

  // hide the profile
  profile.style.opacity = 0;
  paginationContainer.style.opacity = 0;
};

///////////////////////////////////////////////////////////////////////////
const displayErrorRepo = function (error) {
  let el = document.querySelector(".error-repo");
  el.innerHTML = error;
  el.style.display = "block";

  // hide the profile
  repository.style.opacity = 0;
  // paginationContainer.style.opacity = 0;
};

// Function to update the profile data in the DOM
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

  // profile.style.opacity = 100;
};

// function to update repository data in the dom
const updateRepository = function (repoData) {
  const repoContainer = document.querySelector(".repository");

  repoContainer.innerHTML = "";

  repoData.forEach((data) => {
    const html = `
    <div class="card">
    <h2>${data.name}</h2>
    <p>${data.description || "No description available"}</p>
    <div class="topic">
    ${
      data.topics.length > 0
        ? data.topics.map((topic) => `<span>${topic}</span>`).join("")
        : "no topics available"
    }
    </div>
  </div>

    `;
    repoContainer.insertAdjacentHTML("afterbegin", html);
  });
};

// pagination function////////////////////////////////////////////
const paginationButtons = function (totalPages) {
  pageContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("h4");
    pageBtn.classList.add("pg");
    pageBtn.textContent = i;
    pageBtn.addEventListener("click", (e) => {
      pageHandler(e);
    });
    pageContainer.appendChild(pageBtn);
  }
  pageButtons = document.querySelectorAll(".pg");
  console.log(pageButtons);
};

// add active class to the pagination buttons////////////////////
const updateActivePagination = function (activePage) {
  pageButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.innerHTML === activePage.toString()) {
      btn.classList.add("active");
    }
  });
};

///////////////////////////////////////////////////////////////////////
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  userName = input.value;
  pageNumber = 1;
  prevBtn.disabled = true;
  nextBtn.disabled = false;
  spinnerUser.style.display = "flex";
  profile.style.opacity = 0;
  repository.style.opacity = 0;
  formRepo.style.opacity = 1;

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

// formRepo.addEventListener("submit", (e) => {
//   e.preventDefault();
//   const repoName = formRepoinput.value;
//   getRepoByName(repoName);
// });

//////////////////////////////////////////////////////////////////////
// next and prev buttons

// const buttonCtrl = function () {
//   if (pageNumber === 1) {
//     prevBtn.disabled = true;
//   } else if (pageNumber === totalPages) {
//     nextBtn.disabled = true;
//   } else {
//     prevBtn.disabled = false;
//     nextBtn.disabled = false;
//   }
//   getUserRepo(userName, pageNumber);
// };

prevBtn.addEventListener("click", () => {
  pageNumber--;
  repository.style.opacity = 0;
  if (pageNumber === 1) {
    prevBtn.disabled = true;
  }
  nextBtn.disabled = false;
  getUserRepo(userName, pageNumber);
  // buttonCtrl();
});

nextBtn.addEventListener("click", function () {
  pageNumber++;
  repository.style.opacity = 0;
  if (pageNumber === totalPages) {
    nextBtn.disabled = true;
  }
  prevBtn.disabled = false;
  getUserRepo(userName, pageNumber);

  // buttonCtrl();
});

const pageHandler = function (e) {
  const page = Number(e.target.innerHTML);
  pageNumber = page;
  console.log(page);
  repository.style.opacity = 0;
  if (pageNumber === 1) {
    prevBtn.disabled = true;
  } else if (pageNumber === totalPages) {
    nextBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }
  getUserRepo(userName, page);
};
