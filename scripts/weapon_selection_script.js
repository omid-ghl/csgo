let balance = 9000;
let pickedWeaponsList = [];
let categorySkinsMap = {}; // Map to store skins data organized by category

async function fetchSkinsData() {
  try {
    const response = await fetch(
      "https://bymykel.github.io/CSGO-API/api/en/skins.json"
    );
    const skinsData = await response.json();

    // Organize skins data by category
    skinsData.forEach((skin) => {
      const categoryName = skin.category.name;
      if (!categorySkinsMap[categoryName]) {
        categorySkinsMap[categoryName] = [];
      }
      categorySkinsMap[categoryName].push(skin);
    });
  } catch (error) {
    console.error("Error fetching skins data:", error);
  }
}

function getRandomPrice(categoryName) {
  let minPrice, maxPrice;
  switch (categoryName.toLowerCase()) {
    case "pistols":
      minPrice = 200;
      maxPrice = 700;
      break;
    case "smgs":
      minPrice = 1000;
      maxPrice = 1500;
      break;
    case "rifles":
      minPrice = 1500;
      maxPrice = 3500;
      break;
    case "heavy":
      minPrice = 2500;
      maxPrice = 4500;
      break;
    case "knives":
      minPrice = 100;
      maxPrice = 500;
      break;
    case "gloves":
      minPrice = 100;
      maxPrice = 500;
      break;
    default:
      minPrice = 0;
      maxPrice = 0;
  }
  minPrice = Math.ceil(minPrice / 50) * 50;
  maxPrice = Math.floor(maxPrice / 50) * 50;

  return (
    Math.floor(Math.random() * ((maxPrice - minPrice) / 50 + 1)) * 50 + minPrice
  );
}

async function populateTabs() {
  const tabDiv = document.getElementById("tabs");
  const selectedTeam = sessionStorage.getItem("selectedTeam");

  try {
    await fetchSkinsData();

    Object.keys(categorySkinsMap).forEach((category) => {
      const tabButton = document.createElement("button");
      tabButton.textContent = category;
      tabButton.classList.add("tablinks");
      tabButton.addEventListener("click", function () {
        openTab(category, selectedTeam);
      });
      tabDiv.appendChild(tabButton);
    });

    // Automatically click the first tab to populate weapons
    const tabLinks = document.querySelectorAll(".tablinks");
    if (tabLinks.length > 0) {
      tabLinks[0].click();
    }
  } catch (error) {
    console.error("Error populating tabs:", error);
  }
}

function toggleSelection(card, price, skin) {
  // Deselect previously selected items from the same tab
  const tabContentDiv = document.getElementById("weapon-collection-content");
  const selectedCards = tabContentDiv.querySelectorAll(".row-card.selected");
  selectedCards.forEach((selectedCard) => {
    if (selectedCard !== card) {
      const selectedSkinName =
        selectedCard.querySelector(".card-content h3").textContent;
      const selectedSkinPrice = parseInt(
        selectedCard.querySelector(".weapon-price h2").textContent
      );
      const selectedSkin = pickedWeaponsList.find(
        (weapon) =>
          weapon.name === selectedSkinName && weapon.price === selectedSkinPrice
      );
      if (selectedSkin) {
        balance += selectedSkin.price;
        selectedCard.classList.remove("selected");
        selectedCard.classList.remove("picked");
        const index = pickedWeaponsList.indexOf(selectedSkin);
        if (index !== -1) {
          pickedWeaponsList.splice(index, 1);
        }
      }
    }
  });

  if (card.classList.contains("selected")) {
    balance += price;
    card.classList.remove("selected");
    card.classList.remove("picked"); // Remove the 'picked' class
    const index = pickedWeaponsList.findIndex(
      (weapon) => weapon.name === skin.name && weapon.price === price
    );
    if (index !== -1) {
      pickedWeaponsList.splice(index, 1);
    }
  } else {
    if (balance - price < 0 || pickedWeaponsList.length >= 6) {
      return; // Prevent selecting if insufficient balance or already selected six items
    }
    balance -= price;
    card.classList.add("selected");
    card.classList.add("picked"); // Add the 'picked' class
    pickedWeaponsList.push({ ...skin, price });
  }
  document.getElementById("balance").textContent = balance;

  // Update disabled-card class for all cards
  const allCards = document.querySelectorAll(".row-card");
  allCards.forEach((card) => {
    const price = parseInt(
      card.querySelector(".weapon-price h2").textContent.slice(0, -2)
    ); // Extract price from card content
    if (price > balance && !card.classList.contains("picked")) {
      // Check if card is not picked
      card.classList.add("disabled-card");
    } else {
      card.classList.remove("disabled-card");
    }
  });

  // Check if six items are picked, if so, enable the confirm button
  const confirmButton = document.getElementById("confirm-btn");

  if (pickedWeaponsList.length < 6) {
    confirmButton.disabled = true;
  } else {
    confirmButton.disabled = false;
  }
}

function selectWeapons() {
  // Store selected weapons in session storage
  sessionStorage.setItem("selectedWeapons", JSON.stringify(pickedWeaponsList));

  // Navigate to the next screen
  window.location.href = "character_review.html";
}

async function populatePurchasedWeaponsList() {
  // Clear the existing list
  const purchasedWeaponsList = document.getElementById(
    "purchased-weapons-list"
  );
  purchasedWeaponsList.innerHTML = "";

  // Populate the list with selected weapons
  pickedWeaponsList.forEach((weapon) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${weapon.name} - ${weapon.price}$`;
    listItem.classList.add("purchased-item");
    listItem.addEventListener("click", function () {
      // Remove the selected weapon from the list and update balance
      balance += weapon.price;
      document.getElementById("balance").textContent = balance;
      listItem.remove();
      // Remove the selected weapon from the pickedWeaponsList
      const index = pickedWeaponsList.indexOf(weapon);
      if (index !== -1) {
        pickedWeaponsList.splice(index, 1);
      }
      // Disable confirm button if less than six items are picked
      const confirmButton = document.getElementById("confirm-btn");
      if (pickedWeaponsList.length < 6) {
        confirmButton.disabled = true;
      }
    });
    purchasedWeaponsList.appendChild(listItem);
  });
}

async function openTab(categoryName, selectedTeam) {
  console.log("Opening tab for category:", categoryName);

  const tabContentDiv = document.getElementById("weapon-collection-content");
  tabContentDiv.innerHTML = "";

  const skins = categorySkinsMap[categoryName] || [];

  const rarityMap = {}; // Map to store skins by rarity

  // Organize skins by rarity
  skins.forEach((skin) => {
    const rarityName = skin.rarity.name;
    if (!rarityMap[rarityName]) {
      rarityMap[rarityName] = [];
    }
    rarityMap[rarityName].push(skin);
  });

  const subTabContainer = document.getElementById("sub-tabs");
  subTabContainer.innerHTML = ""; // Clear existing sub-tabs

  // Create sub-tabs for each rarity
  Object.keys(rarityMap).forEach((rarityName) => {
    const subTabButton = document.createElement("button");
    subTabButton.textContent = rarityName;
    subTabButton.classList.add("sub-tablinks");
    subTabButton.addEventListener("click", function () {
      openSubTab(categoryName, rarityName, selectedTeam);
    });
    subTabContainer.appendChild(subTabButton);
  });

  // Automatically click the first sub-tab to populate weapons
  const subTabLinks = document.querySelectorAll(".sub-tablinks");
  if (subTabLinks.length > 0) {
    subTabLinks[0].click();
  }
}

async function openSubTab(categoryName, rarityName, selectedTeam) {
  console.log(
    "Opening sub-tab for category:",
    categoryName,
    "with rarity:",
    rarityName
  );

  const tabContentDiv = document.getElementById("weapon-collection-content");
  tabContentDiv.innerHTML = "";

  const skins = categorySkinsMap[categoryName] || [];

  if (skins.length > 0) {
    skins.forEach((skin) => {
      if (
        skin.rarity.name === rarityName &&
        (skin.team.id === selectedTeam.toLowerCase() || skin.team.id === "both")
      ) {
        const price = getRandomPrice(categoryName);
        const skinDiv = createSkinCard(skin, price);

        // Check if the price exceeds the balance
        if (price > balance) {
          skinDiv.classList.add("disabled-card");
        } else {
          skinDiv.addEventListener("click", function () {
            toggleSelection(skinDiv, price, skin);
          });
        }

        tabContentDiv.appendChild(skinDiv);
      }
    });
  } else {
    console.log("No skins found for category:", categoryName);
  }
}

function createSkinCard(skin, price) {
  const skinDiv = document.createElement("div");
  skinDiv.classList.add("row-card");

  skinDiv.innerHTML = `
    <div class="card" style="position: relative;">
      <img src="${skin.image}" alt="${skin.name}">
      <div class="picked-badge">Picked</div>
    </div>
    <div class="card-content">
      <h3>${skin.name}</h3>
      <p>${skin.category.name} - ${skin.rarity.name} - ${skin.pattern.name}</p>
    </div>
    <div class="weapon-price">
      <h2>${price} $</h2>
    </div>
  `;

  return skinDiv;
}

document.addEventListener("DOMContentLoaded", function () {
  // Function to handle tab clicks
  function handleTabClick(event) {
    const tabs = document.querySelectorAll(".tablinks");
    tabs.forEach((tab) => {
      tab.classList.remove("active");
    });

    event.target.classList.add("active");
  }

  // Function to handle sub-tab clicks
  function handleSubTabClick(event) {
    const subTabs = document.querySelectorAll(".sub-tablinks");
    subTabs.forEach((subTab) => {
      subTab.classList.remove("active");
    });

    event.target.classList.add("active");
  }

  // Populate tabs and sub-tabs
  populateTabs();

  // Add event listeners for tab clicks
  const tabContainer = document.getElementById("tabs");
  tabContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("tablinks")) {
      handleTabClick(event);
    }
  });

  // Add event listeners for sub-tab clicks
  const subTabContainer = document.getElementById("sub-tabs");
  subTabContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("sub-tablinks")) {
      handleSubTabClick(event);
    }
  });

  // Event listener for the confirm button
  document.getElementById("confirm-btn").addEventListener("click", function () {
    selectWeapons();
  });

  // Populate purchased weapons list
  populatePurchasedWeaponsList();
});
