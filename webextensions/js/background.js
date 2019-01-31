// MAJ d'onglet
function updateActiveTab() {
  // MAJ de l'icone en fonction de l'url > .matchhistory.*.leagueoflegends.com/.
  function updateLogo(tabs) {
    // MAJ l'icone.
    function setLogo(path, tabId) {
      browser.browserAction.setIcon({ path: path, tabId: tabId });
    }

    if (tabs[0].url == undefined) {
      setLogo('img/logo-disabled.png', tabs[0].id);
    } else if (tabs[0].url.match(/^.*matchhistory\..*\.leagueoflegends.com\/.*/)) {
      setLogo('img/logo.png', tabs[0].id);
    } else {
      setLogo('img/logo-disabled.png', tabs[0].id);
    }
  }

  browser.tabs.query({ active: true, currentWindow: true }).then(updateLogo);
}

window.addEventListener('load', function () {
  // Listener - Changement d'URL
  browser.tabs.onUpdated.addListener(updateActiveTab);

  // Listener - Changement d'onglet
  browser.tabs.onActivated.addListener(updateActiveTab);

  // Listener - Changement de fenêtre
  browser.windows.onFocusChanged.addListener(updateActiveTab);

  // Chargement de l'extension
  updateActiveTab();
});
