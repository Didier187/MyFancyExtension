let extensionOn = "off";
let isToBeIgnored = false;
let listofWebsitesToIgnore = [];
const displayStatus = document.getElementById("status");
const cookCount = document.getElementById("count");
const powerButton = document.getElementById("power");
const listofWebsitesToIgnoreFromLocalStorage = JSON.parse(
  localStorage.getItem("prive-cookie-websites-to-ignore")
);
const countFromLocalStorage = JSON.parse(
  localStorage.getItem("prive-cookie-count")
);
if (countFromLocalStorage) {
  cookCount.innerHTML = countFromLocalStorage;
}
if (listofWebsitesToIgnoreFromLocalStorage) {
  listofWebsitesToIgnore = listofWebsitesToIgnoreFromLocalStorage;
}

// power button
const powerStateFromLocalStorage = JSON.parse(
  localStorage.getItem("prive-cookie-power-state")
);
const turnOnStyles = () => {
  powerButton.classList.add("on");
  powerButton.classList.remove("off");
  displayStatus.classList.add("on");
  displayStatus.classList.remove("off");
};
const turnOffStyles = () => {
  powerButton.classList.add("off");
  powerButton.classList.remove("on");
  displayStatus.classList.add("off");
  displayStatus.classList.remove("on");
};

if (powerStateFromLocalStorage) {
  extensionOn = powerStateFromLocalStorage;
  if (extensionOn === "on") {
    displayStatus.innerHTML = "Running...";
    turnOnStyles();
  } else {
    displayStatus.innerHTML = "OFF";
    turnOffStyles();
  }
}
powerButton.addEventListener("click", () => {
  extensionOn = extensionOn === "on" ? "off" : "on";
  displayStatus.innerHTML = extensionOn === "on" ? "Running..." : "OFF";
  localStorage.setItem("prive-cookie-power-state", JSON.stringify(extensionOn));
  if (extensionOn === "on") {
    turnOnStyles();
  } else {
    turnOffStyles();
  }
});

const updateExtensionState = (newValue) => {
  extensionOn = newValue;
  displayStatus.innerHTML = newValue === "on" ? "Running..." : "OFF";
  localStorage.setItem("prive-cookie-power-state", JSON.stringify(extensionOn));
  extensionOn === "on" ? turnOnStyles() : turnOffStyles();
};

function getCookies() {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll({}, (cookies) => {
      resolve(cookies);
    });
  });
}

const updateCount = () => {
  // get the number of cookies and add them to the count
  getCookies().then((cookies) => {
    let count = cookies.length;
    let countFromLocalStorage = JSON.parse(
      localStorage.getItem("prive-cookie-count")
    );
    if (countFromLocalStorage) {
      count += countFromLocalStorage;
    }
    localStorage.setItem("prive-cookie-count", JSON.stringify(count));
    cookCount.innerHTML = Intl.NumberFormat("en", {
      notation: "compact",
    }).format(count);
  });
};

// if the extension is on, delete all cookies on tab close
if (extensionOn === "on") {
  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    updateCount();
    chrome.cookies.getAll({}, (cookies) => {
      cookies.forEach((cookie) => {
        chrome.cookies.remove({
          url: `http${cookie.secure ? "s" : ""}://${cookie.domain}${
            cookie.path
          }`,
          name: cookie.name,
        });
      });
    });
  });
}
// on tab update, clear cookies
if (extensionOn === "on") {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    updateCount();
    chrome.cookies.getAll({}, (cookies) => {
      cookies.forEach((cookie) => {
        chrome.cookies.remove({
          url: `http${cookie.secure ? "s" : ""}://${cookie.domain}${
            cookie.path
          }`,
          name: cookie.name,
        });
      });
    });
  });
}

// resetting the count
const resetCount = () => {
  localStorage.removeItem("prive-cookie-count");
  cookCount.innerHTML = 0;
};
const resetPowerState = () => {
  localStorage.removeItem("prive-cookie-power-state");
  displayStatus.innerHTML = "OFF";
  turnOffStyles();
};
const resetAll = () => {
  resetCount();
  resetPowerState();
};
const resetButton = document.getElementById("reset-extension");
resetButton.addEventListener("click", resetAll);
const ignoreButton = document.getElementById("ignore");

const addWebsiteToIgnore = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    var url = currentTab.url;
    var domain = url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
    if (!listofWebsitesToIgnore.includes(domain)) {
      listofWebsitesToIgnore.push(domain);
      updateExtensionState("off");
      ignoreButton.innerHTML = "Unignore";
      ignoreButton.classList.add("ignored");
      localStorage.setItem(
        "prive-cookie-websites-to-ignore",
        JSON.stringify(listofWebsitesToIgnore)
      );
    }
  });
};

const removeWebsiteFromIgnore = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    var url = currentTab.url;
    var domain = url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
    if (listofWebsitesToIgnore.includes(domain)) {
      listofWebsitesToIgnore.pop(domain);
      updateExtensionState("on");
      ignoreButton.innerHTML = "Ignore";
      ignoreButton.classList.remove("ignored");
      localStorage.setItem(
        "prive-cookie-websites-to-ignore",
        JSON.stringify(listofWebsitesToIgnore)
      );
    }
  });
};
ignoreButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    var url = currentTab.url;
    var domain = url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
    if (!listofWebsitesToIgnore.includes(domain)) {
      addWebsiteToIgnore();
    } else {
      removeWebsiteFromIgnore();
    }
  });
});

// if current website is in the list of websites to ignore, turn off the extension
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var currentTab = tabs[0];
  var url = currentTab.url;
  var domain = url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
  if (listofWebsitesToIgnore.includes(domain)) {
    updateExtensionState("off");
    ignoreButton.innerHTML = "Unignore";
    ignoreButton.classList.add("ignored");
  } else {
    updateExtensionState("on");
    ignoreButton.innerHTML = "Ignore";
    ignoreButton.classList.remove("ignored");
  }
});
