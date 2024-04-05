document.addEventListener('DOMContentLoaded', function () {
  // Retrieve selected character and weapons data from session storage
  const characterName = sessionStorage.getItem('characterNameInput');
  const selectedWeapons = JSON.parse(sessionStorage.getItem('selectedWeapons'));
  const pickedAgent = JSON.parse(sessionStorage.getItem('selectedCharacter'));

  // Populate character name
  const characterNameElement = document.getElementById('character-name');
  characterNameElement.textContent =
    characterName + ' --- ' + pickedAgent?.name;

  console.log('characterNamecharacterNamecharacterName', characterName);
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
              <img alt="Picked Agent"  src=${weapon.image} />
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

  document.getElementById('next-btn').addEventListener('click', function () {
    window.location.href = 'team_review.html'; // Navigate back to weapon selection screen
  });
});
