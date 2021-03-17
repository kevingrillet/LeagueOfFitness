const
  KILL       = 0,
  DEATH      = 1,
  ASSIST     = 2,
  VICTORY    = 3,
  DEFEAT     = 4,
  TURRET     = 5,
  INHIBITOR  = 6,
  BARON      = 7,
  DRAGON     = 8,
  RIFT       = 9,
  ETURRET    = 10,
  EINHIBITOR = 11,
  EBARON     = 12,
  EDRAGON    = 13,
  ERIFT      = 14,
  CST        = [
    "Kill", "Death", "Assist",
    "Victory", "Defeat",
    "Turret", "Inhibitor", "Baron", "Dragon", "Rift",
    "Turret", "Inhibitor", "Baron", "Dragon", "Rift"
  ];

var
  fpu = fsu = fs = 0,
  ver  = 1.2,
  //       KI, DE, AS, VI, DEF, TU, IN,  BA,  DR, RI, ETU, EIN, EBA, EDR, ERI
  pu   = [0.5,  1,  0,  2,   4,  0,  0,   0,   0,  0,   0,   0,   0, 1.5,   5],
  su   = [  0,  0,  1,  6,  10,  0,  0,   0,   0,  0,   0,   2, 4.5,   0,   0],
  s    = [  0,  0,  0, 12,  16,  0,  0,   0,   0,  0,   5,   0,   0,   0,   0];

// Récupère les données dans le storage ou conserve les valeurs par défaut.
function initSettings() {
  function setSettings(data) {
    if (ver == data.ver) {
      pu = data.pu;
      su = data.su;
      s  = data.s;
    } else if (data.ver == 1.0) {
      for (let index = 0; index < data.pu.length; index++) {
        var itmp = index;
        if (pu.length != data.pu.length && index >= TURRET) {
          itmp = index + 5;
        }
        pu[itmp] = data.pu[index];
        su[itmp] = data.su[index];
        s[itmp]  = data.s[index];
      }
    }
  }

  chrome.storage.local.get({ 'ver': 1.0, 'pu': pu, 'su': su, 's': s }, function (data) { setSettings(data) });
}

// Créé le tableau settings & charge les données.
function loadSettings() {
  var st = document.querySelector("#settingsTab");
  while (st.firstChild) {
    st.removeChild(st.firstChild);
  }
  for (let index = 0; index < pu.length; index++) {
    var ln = st.appendChild(document.createElement('tr'));
    if (index == KILL) {
      var th       = ln.appendChild(document.createElement('th'));
      th.scope     = "row";
      th.rowSpan   = "3";
      th.innerHTML = "KDA";
    } else if (index == VICTORY) {
      var th       = ln.appendChild(document.createElement('th'));
      th.scope     = "row";
      th.rowSpan   = "2";
      th.innerHTML = "GAME";
    } else if (index == TURRET) {
      var th       = ln.appendChild(document.createElement('th'));
      th.scope     = "row";
      th.rowSpan   = "5";
      th.innerHTML = "ALLY";
    } else if (index == ETURRET) {
      var th       = ln.appendChild(document.createElement('th'));
      th.scope     = "row";
      th.rowSpan   = "5";
      th.innerHTML = "ENEMY";
    }
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

// Vérifie que la sauvegarde est possible
function trySave() {
  document.querySelector("#ok").style.display = "none";
  document.querySelector("#ko").style.display = "none";

  var canSave = true;
  var st = document.querySelector("#settingsTab");
  var ln = st.firstElementChild;
  var
    tpu = [],
    tsu = [],
    ts  = [];

  for (let index = 0; index < pu.length; index++) {
    switch (index) {
      case KILL:
      case VICTORY:
      case TURRET:
      case ETURRET:
        var th = ln.firstElementChild.nextElementSibling;
        break;

      default:
        var th = ln.firstElementChild;
        break;
    }
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
    document.querySelector("#ok").style.display = "block";
  } else {
    document.querySelector("#ko").style.display = "block";
  }
}

// Sauvegarde
function saveSettings() {
  chrome.storage.local.set({ 'ver': ver, 'pu': pu, 'su': su, 's': s }, function () {
    load();
  });
}

// Parse le dom envoyé en paramètre et fait le calcul.
function fitness(doc) {
  var
    fpu = fsu = fs = 0,
    //       KI, DE, AS, VI, DEF, TU, IN, BA, DR, RI, ETU, EIN, EBA, EDR, ERI
    data = [  0,  0,  0,  0,   0,  0,  0,  0,  0,  0,   0,   0,   0,   0,   0];

  var docCurrentUser = doc.querySelector(".classic.current-user.player");

  // KDA
  var docKDA = docCurrentUser.querySelector(".kda-kda");
  var docK   = docKDA.firstChild;
  var docD   = docK.nextElementSibling;
  var docA   = docD.nextElementSibling;

  data[KILL]   = docK.innerHTML;
  data[DEATH]  = docD.innerHTML;
  data[ASSIST] = docA.innerHTML;

  // GAME
  var docTeamHeader = docCurrentUser.parentNode.parentNode.parentNode.firstElementChild;

  var ga = docTeamHeader.firstElementChild.firstElementChild.querySelector(".game-conclusion").innerHTML;
  if (ga.match(/.*VICTORY.*/) || ga.match(/.*VICTOIRE.*/)) {
    data[VICTORY] = 1;
    data[DEFEAT]  = 0;
  } else {
    data[VICTORY] = 0;
    data[DEFEAT]  = 1;
  }

  // ALLY
  var docTeamFooter = docCurrentUser.parentNode.parentNode.nextElementSibling.firstElementChild.firstElementChild;

  data[TURRET]    = docTeamFooter.querySelector(".tower-kills").querySelector("span").innerHTML;
  data[INHIBITOR] = docTeamFooter.querySelector(".inhibitor-kills").querySelector("span").innerHTML;
  data[BARON]     = docTeamFooter.querySelector(".baron-kills").querySelector("span").innerHTML;
  data[DRAGON]    = docTeamFooter.querySelector(".dragon-kills").querySelector("span").innerHTML;
  data[RIFT]      = docTeamFooter.querySelector(".rift-herald-kills").querySelector("span").innerHTML;

  // ENEMY
  var docTeam  = docTeamHeader.parentNode.parentNode;
  var docEnemy = docTeam.nextElementSibling;
  if (docEnemy == null) {
    docEnemy = docTeam.previousElementSibling;
  }
  var docEnemyFooter = docEnemy.firstElementChild.firstElementChild.nextElementSibling.nextElementSibling.firstElementChild.firstElementChild;

  data[ETURRET]    = docEnemyFooter.querySelector(".tower-kills").querySelector("span").innerHTML;
  data[EINHIBITOR] = docEnemyFooter.querySelector(".inhibitor-kills").querySelector("span").innerHTML;
  data[EBARON]     = docEnemyFooter.querySelector(".baron-kills").querySelector("span").innerHTML;
  data[EDRAGON]    = docEnemyFooter.querySelector(".dragon-kills").querySelector("span").innerHTML;
  data[ERIFT]      = docEnemyFooter.querySelector(".rift-herald-kills").querySelector("span").innerHTML;

  // MATHS
  for (let index = 0; index < data.length; index++) {
    fpu += pu[index] * data[index];
    fsu += su[index] * data[index];
    fs  += s[index] * data[index];
  }

  return [fpu, fsu, fs];
};

// En cas de problème fait apparaitre le message d'erreur.
function err() {
  document.querySelector("#pb").style.display = "block";
  document.querySelector("#fit").style.display = "none";
}

// Récupère le dom et tente de faire l'update
function upd(doc){
  try {
    var data = fitness(doc);
    document.querySelector("#pu").innerHTML = data[0];
    document.querySelector("#su").innerHTML = data[1];
    document.querySelector("#s").innerHTML  = data[2];
  } catch (error) {
    err();
  }
}

// Traitement principal. Regarde l'onglet, si l'url est bonne lance le traitement, sinon message d'erreur
function load() {
  function run(tabs) {
    if (tabs[0].url == undefined) {
      err();
    } else if (tabs[0].url.match(/^.*matchhistory\..*\.leagueoflegends.com\/.*/)) {
      initSettings();
      chrome.tabs.sendMessage(tabs[0].id, { text: "report_back" }, function (response) {
        // Le traitement s'effectue après que chrome.storage.local.get soit terminé
        loadSettings();
        upd(new DOMParser().parseFromString(response, "text/html"));
      });
    } else {
      err();
    }
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) { run(tabs) });
}

// Listener - Tous les boutons de la popup.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#save').addEventListener('click', function () {
    trySave();
  });
  document.querySelector('#refresh').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.reload(tabs[0].id);
    });
  });
  document.querySelector('#reset').addEventListener('click', function () {
    document.querySelector("#ok").style.display = "none";
    document.querySelector("#ko").style.display = "none";
    chrome.storage.local.clear();
    pu   = [0.5,  1,  0,  2,   4,  0,  0,   0,   0,  0,   0,   0,   0, 1.5,   5],
    su   = [  0,  0,  1,  6,  10,  0,  0,   0,   0,  0,   0,   2, 4.5,   0,   0],
    s    = [  0,  0,  0, 12,  16,  0,  0,   0,   0,  0,   5,   0,   0,   0,   0];
    load();
  })
});

// Listener - La page est chargée, on commence le traitement.
window.addEventListener('load', function () {
  load();
});
