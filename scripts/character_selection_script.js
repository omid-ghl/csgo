// Function to fetch agent data from the API
async function fetchAgentData() {
  try {
    const response = await fetch(
      'https://bymykel.github.io/CSGO-API/api/en/agents.json',
    );
    if (!response.ok) {
      throw new Error('Failed to fetch agent data');
    }
    const agents = await response.json();
    return agents;
  } catch (error) {
    console.error('Error fetching agent data:', error);
    return [];
  }
}

async function populateCharacterList(selectedTeam) {
  const characterListDiv = document.getElementById('character-list');
  characterListDiv.innerHTML = ''; // Clear previous content

  const agents = await fetchAgentData();
  if (!agents || agents.length === 0) {
    console.error('No agent data found.');
    return;
  }

  const filteredAgents = agents.filter(
    agent => agent.team.name.toLowerCase() === selectedTeam.toLowerCase(),
  );
  if (filteredAgents.length === 0) {
    console.error('No agents found for the selected team.');
    return;
  }

  filteredAgents.forEach(agent => {
    const agentDiv = document.createElement('div');
    agentDiv.classList.add('card'); // Add 'card' class to the div
    agentDiv.innerHTML = `
      <img src="${agent.image}" alt="${agent.name}">
      <h3>${agent.name}</h3>
    `;
    agentDiv.addEventListener('click', function () {
      selectCharacter(agent); // Pass the selected agent to the function
    });
    characterListDiv.appendChild(agentDiv);
  });
}

// Function to handle character selection
function selectCharacter(selectedAgent) {
  const selectedCard = document.querySelector('.card.selected');
  if (selectedCard) {
    selectedCard.classList.remove('selected'); // Remove selection from previously selected card
  }
  const clickedCard = event.currentTarget;
  clickedCard.classList.add('selected'); // Add selection to the clicked card

  // Save selected character's data and input data in session storage
  sessionStorage.setItem('selectedCharacter', JSON.stringify(selectedAgent));
}

document.addEventListener('DOMContentLoaded', function () {
  const team = sessionStorage.getItem('selectedTeam');
  if (team) {
    populateCharacterList(team);
  } else {
    console.error('Team not found in sessionStorage.');
  }

  const confirmBtn = document.getElementById('confirm-btn');
  confirmBtn.addEventListener('click', function () {
    const characterNameInput = document.getElementById('character-name');

    sessionStorage.setItem('characterNameInput', characterNameInput.value);

    const selectedCard = document.querySelector('.card.selected');
    if (!selectedCard) {
      alert('Please select a character.');
      return;
    }

    // Redirect to the next page with character and team data
    window.location.href = `weapon_selection.html`;
  });
});
