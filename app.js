const meals = document.getElementById("meals");
const favContainer = document.querySelector(".fav-meals"); // ul
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.querySelector(".meal-info");
let selectedBtn;

// Events
getRandomMeal();
fetchFavMeals();
searchBtn.addEventListener("click", callSearchResults);

// \\

// Methods

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const respData = await resp.json();
  const randomMeal = respData.meals[0];
  console.log(randomMeal);

  addMeal(randomMeal, true);
}

async function fetchFavMeals() {
  // Clean the Container
  favContainer.innerHTML = "";

  const mealIds = getMealsFromLS();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);
    addMealFav(meal);
  }
}

async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const respData = await resp.json();
  const meal = respData.meals[0];
  return meal;
}

function addMealFav(mealData) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
            <img
              src="${mealData.strMealThumb}"
              alt="${mealData.strMeal}"
            />
            <span>${mealData.strMeal}</span>
            <button class="clear"><i class="fas fa-window-close"></i></button>`;

  favContainer.appendChild(favMeal);

  const btn = favMeal.querySelector(".clear");
  btn.addEventListener("click", () => {
    removeMealFromLS(mealData.idMeal);
    fetchFavMeals();
  });

  const favMealImg = favMeal.querySelector("img");
  favMealImg.addEventListener("click", () => {
    showMealInfo(mealData);
  });
}

function addMeal(mealData, random = false) {
  const meal = document.createElement("div");
  meal.classList.add("meal");

  meal.innerHTML = `
  <div class="meal-header">
  ${random ? `<span class="random"> Random Recipe </span>` : ""}
            <img
              src="${mealData.strMealThumb}"
              alt="${mealData.strMeal}"
            />
          </div>
          <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
              <i class="fa fa-heart"></i>
            </button>
          </div>`;

  const btn = meal.querySelector(".meal-body .fav-btn");

  // When Heart Btn is Pushed
  btn.addEventListener("click", (e) => {
    if (btn.classList.contains("active")) {
      removeMealFromLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      selectedBtn = e.target.parentElement;
      selectedBtn.classList.add("active");
      addMealToLS(mealData.idMeal);
    }

    fetchFavMeals();
  });

  meals.appendChild(meal);

  const mealImg = meal.querySelector(".meal-header img");
  mealImg.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  const mealName = meal.querySelector(".meal-body h4");
  mealName.addEventListener("click", () => {
    showMealInfo(mealData);
  });
}

// Meal Info
function showMealInfo(mealData) {
  // Clea it up
  mealInfoEl.innerHTML = "";

  // Update the meal info
  const mealEl = document.createElement("div");

  const ingredients = [];

  // get ingredients data
  for (let i = 1; i <= 20; i++) {
    console.log("caled");
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = `<button id="close-popup" class="close-popup">
  <i class="fas fa-times"></i>
</button>
  <h2>${mealData.strMeal}</h2>
  <img class="meal-info-img" src="${mealData.strMealThumb}" alt="${
    mealData.strMeal
  }" />

  <p>
    ${mealData.strInstructions}
  </p>
  <h3>Ingredients</h3>
  <ul>
    ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
  </ul>`;

  mealInfoEl.appendChild(mealEl);

  // show the popup
  mealPopup.classList.remove("hidden");

  // Close the popup
  const popupCloseBtn = document.getElementById("close-popup");
  popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
  });
}
// \\

// Search
async function callSearchResults() {
  meals.innerHTML = "";
  const search = searchTerm.value;
  const results = await getMealBySearch(search);
  if (results) {
    results.forEach((result) => {
      addMeal(result);
    });
  } else {
    meals.innerHTML = `<h3 class="no-results">Not Found</h3>`;
  }
}

async function getMealBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await resp.json();
  const meals = respData.meals;

  return meals;
}

// Local Strage Funcs
function getMealsFromLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

function addMealToLS(mealId) {
  const mealIds = getMealsFromLS();
  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLS(mealId) {
  const mealIds = getMealsFromLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}
// \\
