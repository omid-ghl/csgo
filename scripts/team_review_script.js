let teammateData = [];
let skinData = [];

const team = sessionStorage.getItem('selectedTeam');
const characterName = sessionStorage.getItem('characterNameInput');
const teamName = sessionStorage.getItem('teamName');

async function fetchTeammateData() {
  try {
    const response = await fetch(
      'https://bymykel.github.io/CSGO-API/api/en/agents.json',
    );

    // its for team checking
    const fullAgentsData = await response.json();
    const filteredAgents = fullAgentsData.filter(
      item => item?.team?.name === team,
    );

    teammateData = filteredAgents;
  } catch (error) {
    console.error('Error fetching teammate data:', error);
  }
}

async function randomUserName() {
  try {
    const response = await fetch('https://randomuser.me/api/');
    const data = await response.json();
    return data.results[0]; // Assuming you only need one random user
  } catch (error) {
    console.error('Error fetching random user data:', error);
    return null;
  }
}

async function fetchSkinData() {
  try {
    const response = await fetch(
      'https://bymykel.github.io/CSGO-API/api/en/skins.json',
    );
    const fullSkinsData = await response.json();

    const filteredSkins = fullSkinsData.filter(item => {
      if (team === 'Counter-Terrorist') {
        return (
          item?.team?.id === 'both' || item?.team?.id === 'counter-terrorists'
        );
      }
      return item?.team?.id === 'both' || item?.team?.id === 'terrorists';
    });

    skinData = filteredSkins;

    console.log('skinDataskinDataskinData', skinData);
  } catch (error) {
    console.error('Error fetching skin data:', error);
  }
}

async function generateRandomTeammateAndItems() {
  await fetchTeammateData();
  await fetchSkinData();

  const randomTeammateIndex = Math.floor(Math.random() * teammateData.length);
  const randomTeammate = teammateData[randomTeammateIndex];

  let totalSkinPrice = 0;
  const selectedSkins = [];

  // Generate 6 random skins for the agent
  while (selectedSkins.length < 6 && totalSkinPrice < 9000) {
    const randomSkinIndex = Math.floor(Math.random() * skinData.length);
    const randomSkin = skinData[randomSkinIndex];

    // Calculate random price based on skin category
    let minPrice, maxPrice;
    switch (randomSkin.category.name.toLowerCase()) {
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

    const randomPrice =
      Math.floor(Math.random() * ((maxPrice - minPrice) / 50 + 1)) * 50 +
      minPrice;

    // Add skin if total price doesn't exceed 9000
    if (totalSkinPrice + randomPrice <= 9000) {
      selectedSkins.push({...randomSkin, price: randomPrice});
      totalSkinPrice += randomPrice;
    }
  }

  return {teammate: randomTeammate, skins: selectedSkins};
}

async function populateRandomTeammatesAndItems() {
  // Retrieve teamName from sessionStorage

  if (team !== 'Counter-Terrorist' && team !== 'Terrorist') {
    console.error('Invalid team selection');
    return;
  }

  // Get the picked agent data from session storage
  const pickedAgent = JSON.parse(sessionStorage.getItem('selectedCharacter'));
  const selectedWeapons = JSON.parse(sessionStorage.getItem('selectedWeapons'));

  // Create a div for the picked agent card
  const pickedAgentInfoDiv = document.createElement('div');
  pickedAgentInfoDiv.classList.add('my-card');
  pickedAgentInfoDiv.innerHTML = `
    <img src="${pickedAgent.image}" alt="${pickedAgent.name}">
    <h3 class="charname">Name: ${characterName}</h3>
    <h3>${pickedAgent.name}</h3>
    <p>${pickedAgent.description}</p>
  `;

  const weaponInfoDiv = document.createElement('div');
  weaponInfoDiv.classList.add('weapons-list');
  selectedWeapons.forEach(skin => {
    const weaponDiv = document.createElement('div');
    weaponDiv.innerHTML = `
      <img src="${skin.image}" alt="${skin.name}">
      <h3>${skin.name}</h3>
      <p>${skin.description}</p>
      <p class="price">Price: $${skin.price}</p>
    `;
    weaponInfoDiv.appendChild(weaponDiv);
  });

  pickedAgentInfoDiv.appendChild(weaponInfoDiv);

  // Display the picked agent card
  document
    .querySelector('.teammates-container')
    .appendChild(pickedAgentInfoDiv);

  // Display teamName in the header div
  const headerDiv = document.querySelector('.title');
  headerDiv.textContent = `💪   ${teamName}`;

  // Generate and display random agent cards
  for (let i = 0; i < 3; i++) {
    // Displaying 2 random agent cards in addition to the picked agent
    const randomSelection = await generateRandomTeammateAndItems(team);
    const teammate = randomSelection.teammate;
    const skins = randomSelection.skins;
    const randomUsername = await randomUserName();

    // Display teammate information on the UI
    const teammateInfoDiv = document.createElement('div');
    teammateInfoDiv.classList.add('teammate-card');
    teammateInfoDiv.innerHTML = `
      <img src="${teammate.image}" alt="${teammate.name}">
      <h3 class="charname">Name: ${
        randomUsername.name.first + ' ' + randomUsername.name.last
      }</h3>
      <h3>${teammate.name}</h3>
      <p>${teammate.description}</p>
    `;

    // Display skins information on the UI
    const skinInfoDiv = document.createElement('div');
    skinInfoDiv.classList.add('skin-card');
    skins.forEach(skin => {
      const skinDiv = document.createElement('div');
      skinDiv.innerHTML = `
        <img src="${skin.image}" alt="${skin.name}">
        <h3>${skin.name}</h3>
        <p>${skin.description}</p>
        <p class="price">Price: $${skin.price}</p>
      `;
      skinInfoDiv.appendChild(skinDiv);
    });

    teammateInfoDiv.appendChild(skinInfoDiv);

    // Display the random agent card
    document.querySelector('.teammates-container').appendChild(teammateInfoDiv);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  populateRandomTeammatesAndItems();

  // Add event listeners for the buttons
  const backButton = document.getElementById('backButton');
  backButton.addEventListener('click', function () {
    window.history.back();
  });

  const regenerateButton = document.getElementById('regenerateButton');
  regenerateButton.addEventListener('click', function () {
    location.reload();
  });

  const restartButton = document.getElementById('restartButton');

  restartButton.addEventListener('click', function () {
    window.location.href = 'index.html';
  });
});
