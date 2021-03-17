// MAJ d'onglet
function updateActiveTab() {
  // MAJ de l'icone en fonction de l'url > .matchhistory.*.leagueoflegends.com/.
  function updateLogo(tabs) {
    // MAJ l'icone.
    function setLogo(path, tabId) {
      chrome.browserAction.setIcon({ path: path, tabId: tabId });
    }

    if (tabs[0].url == undefined) {
      setLogo('img/logo-disabled.png', tabs[0].id);
    } else if (tabs[0].url.match(/^.*matchhistory\..*\.leagueoflegends.com\/.*/)) {
      setLogo('img/logo.png', tabs[0].id);
    } else {
      setLogo('img/logo-disabled.png', tabs[0].id);
    }
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) { updateLogo(tabs) });
}

window.addEventListener('load', function () {
  // Listener - Changement d'URL
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) { updateActiveTab(); });

  // Listener - Changement d'onglet
  chrome.tabs.onActivated.addListener(function (info) { updateActiveTab(); });

  // Listener - Changement de fenêtre
  chrome.windows.onFocusChanged.addListener(function (windowId) { updateActiveTab(); });

  // Chargement de l'extension
  updateActiveTab();
});
