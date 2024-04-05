let balance = 9000;
let pickedWeaponsList = [];
let categorySkinsMap = {}; // Map to store skins data organized by category

async function fetchSkinsData() {
  try {
    const response = await fetch(
      'https://bymykel.github.io/CSGO-API/api/en/skins.json',
    );
    const skinsData = await response.json();

    // Organize skins data by category
    skinsData.forEach(skin => {
      const categoryName = skin.category.name;
      if (!categorySkinsMap[categoryName]) {
        categorySkinsMap[categoryName] = [];
      }
      categorySkinsMap[categoryName].push(skin);
    });
  } catch (error) {
    console.error('Error fetching skins data:', error);
  }
}

async function openTab(categoryName, selectedTeam) {
  console.log('Opening tab for category:', categoryName); // Debugging statement

  const tabContentDiv = document.getElementById('weapon-collection-content');
  tabContentDiv.innerHTML = '';

  const skins = categorySkinsMap[categoryName] || [];

  console.log('Filtered skins:', skins); // Debugging statement

  if (skins.length > 0) {
    skins.forEach(skin => {
      // Check if the skin's team matches the selected team or it's for both teams
      if (
        skin.team.id === selectedTeam.toLowerCase() ||
        skin.team.id === 'both'
      ) {
        const price = getRandomPrice(categoryName);
        const skinDiv = document.createElement('div');
        skinDiv.classList.add('row-card');

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

        // Check if the price exceeds the balance
        if (price > balance) {
          skinDiv.classList.add('disabled-card');
        } else {
          skinDiv.addEventListener('click', function () {
            toggleSelection(skinDiv, price, skin);
          });
        }

        tabContentDiv.appendChild(skinDiv);
      }
    });
  } else {
    console.log('No skins found for category:', categoryName); // Debugging statement
  }
}

function getRandomPrice(categoryName) {
  let minPrice, maxPrice;
  switch (categoryName.toLowerCase()) {
    case 'pistols':
      minPrice = 200;
      maxPrice = 700;
      break;
    case 'smgs':
      minPrice = 1000;
      maxPrice = 1500;
      break;
    case 'rifles':
      minPrice = 1500;
      maxPrice = 3500;
      break;
    case 'heavy':
      minPrice = 2500;
      maxPrice = 4500;
      break;
    case 'knives':
      minPrice = 100;
      maxPrice = 500;
      break;
    case 'gloves':
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
  const tabDiv = document.getElementById('tabs');
  const selectedTeam = sessionStorage.getItem('selectedTeam');

  try {
    await fetchSkinsData();

    Object.keys(categorySkinsMap).forEach(category => {
      const tabButton = document.createElement('button');
      tabButton.textContent = category;
      tabButton.classList.add('tablinks');
      tabButton.addEventListener('click', function () {
        openTab(category, selectedTeam);
      });
      tabDiv.appendChild(tabButton);
    });

    // Automatically click the first tab to populate weapons
    const tabLinks = document.querySelectorAll('.tablinks');
    if (tabLinks.length > 0) {
      tabLinks[0].click();
    }
  } catch (error) {
    console.error('Error populating tabs:', error);
  }
}

function toggleSelection(card, price, skin) {
  // Deselect previously selected items from the same tab
  const tabContentDiv = document.getElementById('weapon-collection-content');
  const selectedCards = tabContentDiv.querySelectorAll('.row-card.selected');
  selectedCards.forEach(selectedCard => {
    if (selectedCard !== card) {
      const selectedSkinName =
        selectedCard.querySelector('.card-content h3').textContent;
      const selectedSkinPrice = parseInt(
        selectedCard.querySelector('.weapon-price h2').textContent,
      );
      const selectedSkin = pickedWeaponsList.find(
        weapon =>
          weapon.name === selectedSkinName &&
          weapon.price === selectedSkinPrice,
      );
      if (selectedSkin) {
        balance += selectedSkin.price;
        selectedCard.classList.remove('selected');
        selectedCard.classList.remove('picked');
        const index = pickedWeaponsList.indexOf(selectedSkin);
        if (index !== -1) {
          pickedWeaponsList.splice(index, 1);
        }
      }
    }
  });

  // Toggle selection of the current card
  if (card.classList.contains('selected')) {
    balance += price;
    card.classList.remove('selected');
    card.classList.remove('picked'); // Remove the 'picked' class
    const index = pickedWeaponsList.findIndex(
      weapon => weapon.name === skin.name && weapon.price === price,
    );
    if (index !== -1) {
      pickedWeaponsList.splice(index, 1);
    }
  } else {
    if (balance - price < 0) {
      return; // Prevent selecting if insufficient balance
    }
    balance -= price;
    card.classList.add('selected');
    card.classList.add('picked'); // Add the 'picked' class
    pickedWeaponsList.push({...skin, price});
  }
  document.getElementById('balance').textContent = balance;

  // Update disabled-card class for all cards
  const allCards = document.querySelectorAll('.row-card');
  allCards.forEach(card => {
    const price = parseInt(
      card.querySelector('.weapon-price h2').textContent.slice(0, -2),
    ); // Extract price from card content
    if (price > balance && !card.classList.contains('picked')) {
      // Check if card is not picked
      card.classList.add('disabled-card');
    } else {
      card.classList.remove('disabled-card');
    }
  });
}

function selectWeapons() {
  // Store selected weapons in session storage
  sessionStorage.setItem('selectedWeapons', JSON.stringify(pickedWeaponsList));

  // Navigate to the next screen
  window.location.href = 'character_review.html';
}

// Document ready event listener
document.addEventListener('DOMContentLoaded', function () {
  populateTabs();

  document.getElementById('confirm-btn').addEventListener('click', function () {
    selectWeapons();
  });

  // Ensure the purchased weapons list is populated when the page loads
  populatePurchasedWeaponsList();
});

async function populatePurchasedWeaponsList() {
  // Clear the existing list
  const purchasedWeaponsList = document.getElementById(
    'purchased-weapons-list',
  );
  purchasedWeaponsList.innerHTML = '';

  // Populate the list with selected weapons
  pickedWeaponsList.forEach(weapon => {
    const listItem = document.createElement('li');
    listItem.textContent = `${weapon.name} - ${weapon.price}$`;
    listItem.classList.add('purchased-item');
    listItem.addEventListener('click', function () {
      // Remove the selected weapon from the list and update balance
      balance += weapon.price;
      document.getElementById('balance').textContent = balance;
      listItem.remove();
      // Remove the selected weapon from the pickedWeaponsList
      const index = pickedWeaponsList.indexOf(weapon);
      if (index !== -1) {
        pickedWeaponsList.splice(index, 1);
      }
    });
    purchasedWeaponsList.appendChild(listItem);
  });
}
