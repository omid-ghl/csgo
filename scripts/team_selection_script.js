document.getElementById('terrorist-btn').addEventListener('click', function () {
  setTeamSession('Terrorist');
  window.location.href = 'character_selection.html';
});

document
  .getElementById('counterterrorist-btn')
  .addEventListener('click', function () {
    setTeamSession('Counter-Terrorist');
    window.location.href = 'character_selection.html';
  });

document
  .getElementById('auto-select-btn')
  .addEventListener('click', function () {
    var randomIndex = Math.floor(Math.random() * 2);
    var selectedTeam = randomIndex === 0 ? 'Terrorist' : 'Counter-Terrorist';
    setTeamSession(selectedTeam);
    window.location.href = 'character_selection.html';
  });

function setTeamSession(team) {
  sessionStorage.setItem('selectedTeam', team);
}
