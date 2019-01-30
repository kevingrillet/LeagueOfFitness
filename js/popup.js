const
  KILL = 0,
  DEATH = 1,
  ASSIST = 2,
  VICTORY = 3,
  DEFEAT = 4,
  TURRET = 5,
  INHIBITOR = 6,
  BARON = 7,
  DRAGON = 8,
  RIFT = 9
  CST = ["Kill", "Death", "Assist", "Victory", "Defeat", "Turret", "Inhibitor", "Baron", "Dragon", "Rift"];

var
  fpu = fsu = fs = 0,
  //       KI, DE, AS, VI, DEF, TU, IN,  BA,  DR, RI   
  pu   = [0.5,  1,  0,  2,   4,  0,  0,   0, 1.5, 5],
  su   = [  0,  0,  1,  6,  10,  0,  2, 4.5,   0, 0],
  s    = [  0,  0,  0, 12,  16,  5,  0,   0,   0, 0];

var initSettings = function () {
  chrome.storage.sync.get({ 'spu': pu, 'ssu': su , 'ss': s}, function (data) {
    pu = data.spu;
    su = data.ssu;
    s  = data.ss;
  });
}

var loadSettings = function () {
  var st = document.getElementById("settingsTab");
  while (st.firstChild) {
    st.removeChild(st.firstChild);
  }
  for (let index = 0; index < pu.length; index++) {
    var ln               = st.appendChild(document.createElement('tr'));
    var th               = ln.appendChild(document.createElement('th'));
    th.scope             = "row";
    th.innerHTML         = CST[index];
    var tdpu             = ln.appendChild(document.createElement('td'));
    tdpu.contentEditable = "true";
    tdpu.innerHTML       = pu[index];
    var tdsu             = ln.appendChild(document.createElement('td'));
    tdsu.contentEditable = "true";
    tdsu.innerHTML       = su[index];
    var tds              = ln.appendChild(document.createElement('td'));
    tds.contentEditable  = "true";
    tds.innerHTML        = s[index];
  }
}

var trySave = function () {
  document.getElementById("ok").style.display = "none";
  document.getElementById("ko").style.display = "none";

  var canSave = true;
  var st = document.getElementById("settingsTab");
  var ln = st.firstElementChild;
  var
    tpu = [],
    tsu = [],
    ts  = [];

  for (let index = 0; index < pu.length; index++) {
    var th = ln.firstElementChild;
    var tdpu = th.nextElementSibling;
    tpu.push(parseFloat(tdpu.innerHTML));
    var tdsu = tdpu.nextElementSibling;
    tsu.push(parseFloat(tdsu.innerHTML));
    var tds = tdsu.nextElementSibling;
    ts.push(parseFloat(tds.innerHTML));
    ln = ln.nextElementSibling;
    if (isNaN(tpu[index]) || isNaN(tsu[index]) || isNaN(ts[index])){
      canSave = false;
      break;
    }
  }

  if (canSave) {
    pu = tpu;
    su = tsu;
    s  = ts;
    saveSettings();
    document.getElementById("ok").style.display = "block";
  } else {
    document.getElementById("ko").style.display = "block";
  }
}

var saveSettings = function () {
  chrome.storage.sync.set({ 'spu': pu, 'ssu': su, 'ss': s }, function () {
    load();
  });
}

var fitness = function (doc) {
  var
    fpu = fsu = fs = 0,
    //       KI, DE, AS, VI, DEF, TU, IN,  BA,  DR, RI
    data = [  0,  0,  0,  0,   0,   0, 0,   0,   0,  0];

  var docCurrentUser = doc.getElementsByClassName("classic current-user player")[0];

  var docKDA = docCurrentUser.getElementsByClassName("kda-kda")[0];
  var docK   = docKDA.firstChild;
  var docD   = docK.nextElementSibling;
  var docA   = docD.nextElementSibling;

  data[KILL]   = docK.innerHTML;
  data[DEATH]  = docD.innerHTML;
  data[ASSIST] = docA.innerHTML;

  var docTeamHeader = docCurrentUser.parentNode.parentNode.parentNode.firstElementChild;

  var ga = docTeamHeader.firstElementChild.firstElementChild.getElementsByClassName("game-conclusion")[0].innerHTML;
  if (ga.match(/.*VICTORY.*/) || ga.match(/.*VICTOIRE.*/)) {
    data[VICTORY] = 1;
    data[DEFEAT]  = 0;
  } else {
    data[VICTORY] = 0;
    data[DEFEAT]  = 1;
  }

  var docTeamFooter = docCurrentUser.parentNode.parentNode.nextElementSibling.firstElementChild.firstElementChild;

  data[TURRET]    = docTeamFooter.getElementsByClassName("tower-kills")[0].getElementsByTagName("span")[0].innerHTML;
  data[INHIBITOR] = docTeamFooter.getElementsByClassName("inhibitor-kills")[0].getElementsByTagName("span")[0].innerHTML;
  data[BARON]     = docTeamFooter.getElementsByClassName("baron-kills")[0].getElementsByTagName("span")[0].innerHTML;
  data[DRAGON]    = docTeamFooter.getElementsByClassName("dragon-kills")[0].getElementsByTagName("span")[0].innerHTML;
  data[RIFT]      = docTeamFooter.getElementsByClassName("rift-herald-kills")[0].getElementsByTagName("span")[0].innerHTML;

  for (let index = 0; index < data.length; index++) {
    fpu += pu[index] * data[index];
    fsu += su[index] * data[index];
    fs  +=  s[index] * data[index];
  }

  return [fpu, fsu, fs];
};

var err = function () {
  document.getElementById("pb").style.display = "block";
  document.getElementById("fit").style.display = "none";      
}

var upd = function (doc){
  try {
    var data = fitness(doc);
    document.getElementById("pu").innerHTML = data[0];
    document.getElementById("su").innerHTML = data[1];
    document.getElementById("s").innerHTML = data[2];
  } catch (error) {
    err();
  }
}

var load = function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function callback(tabs) {
    if (tabs[0].url == undefined) {
      err();
    } else if (tabs[0].url.match(/^.*matchhistory\..*\.leagueoflegends.com\/.*/)) {
      initSettings();
      chrome.tabs.sendMessage(tabs[0].id, { text: "report_back" }, function (response) {
        loadSettings();
        upd(new DOMParser().parseFromString(response, "text/html"));
      });
    } else {
      err();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('save').addEventListener('click', function () {
    trySave();
  });
  document.getElementById('refresh').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.reload(tabs[0].id);
    });
  });
  document.getElementById('reset').addEventListener('click', function () {
    document.getElementById("ok").style.display = "none";
    document.getElementById("ko").style.display = "none";
    chrome.storage.sync.clear();
    pu   = [0.5,  1,  0,  2,   4,  0,  0,   0, 1.5, 5];
    su   = [  0,  0,  1,  6,  10,  0,  2, 4.5,   0, 0];
    s    = [  0,  0,  0, 12,  16,  5,  0,   0,   0, 0];
    load();
  })
});

window.addEventListener('load', function () {
  load();
});