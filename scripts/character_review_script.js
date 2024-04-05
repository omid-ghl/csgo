document.addEventListener('DOMContentLoaded', function () {
  // Retrieve selected character and weapons data from session storage
  const characterName = sessionStorage.getItem('characterNameInput');
  const selectedWeapons = JSON.parse(sessionStorage.getItem('selectedWeapons'));
  const pickedAgent = JSON.parse(sessionStorage.getItem('selectedCharacter'));

  // Populate character name
  const characterNameElement = document.getElementById('character-name');
  characterNameElement.textContent =
    characterName + ' --- ' + (pickedAgent?.name ?? '');

  // Populate picked agent's image
  const pickedAgentImage = document.getElementById('picked-agent-image');
  pickedAgentImage.src = pickedAgent?.image ?? '';

  // Populate selected weapons list
  const weaponsListDiv = document.getElementById('weapons-list');
  if (selectedWeapons) {
    selectedWeapons.forEach(weapon => {
      const weaponItem = document.createElement('div');
      weaponItem.classList.add('weapon-item');

      weaponItem.innerHTML = `
        <img alt="Picked Agent" src=${weapon.image} />
        <p>${weapon.name}</p>
        <p>$${weapon.price}</p>
      `;
      weaponsListDiv.appendChild(weaponItem);
    });
  }

  // Back button event listener
  document.getElementById('back-btn').addEventListener('click', function () {
    window.location.href = 'weapon_selection.html'; // Navigate back to weapon selection screen
  });

  // Next button event listener
  const nextButton = document.getElementById('next-btn');
  nextButton.addEventListener('click', function () {
    window.location.href = 'team_review.html'; // Navigate to team review screen
  });

  // Team name input field event listener
  const teamNameInput = document.getElementById('team-name-input');
  teamNameInput.addEventListener('input', function () {
    // Enable or disable the Next button based on input presence
    if (teamNameInput.value.trim() !== '') {
      nextButton.disabled = false;
      nextButton.style.backgroundColor = '#1e88e5'; // Set background color to default
    } else {
      nextButton.disabled = true;
      nextButton.style.backgroundColor = '#888'; // Change background color when disabled
    }
  });

  // Initialize Next button color based on initial input state
  if (teamNameInput.value.trim() === '') {
    nextButton.disabled = true;
    nextButton.style.backgroundColor = '#888';
  } else {
    nextButton.disabled = false;
    nextButton.style.backgroundColor = '#1e88e5';
  }

  // Save team name to sessionStorage when Next button is clicked
  nextButton.addEventListener('click', function () {
    const teamName = teamNameInput.value.trim();
    sessionStorage.setItem('teamName', teamName);
  });
});
