var updateLogo = function (url, tabId) {
  if (url == undefined) {
    chrome.browserAction.setIcon({ path: 'img/logo-disabled.png', tabId: tabId });
  } else if (url.match(/^.*matchhistory\..*\.leagueoflegends.com\/.*/)) {
    chrome.browserAction.setIcon({ path: 'img/logo.png', tabId: tabId });
  } else {
    chrome.browserAction.setIcon({ path: 'img/logo-disabled.png', tabId: tabId });
  }
}

chrome.tabs.onActivated.addListener(function (info) {
  chrome.tabs.get(info.tabId, function (change) {
    updateLogo(change.url, info.tabId);
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  updateLogo(tab.url, tabId);
});