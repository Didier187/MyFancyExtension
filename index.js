async function getTrackers() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let domain = "";
  if (tab?.url) {
    try {
      let url = new URL(tab.url);
      domain = url.hostname;
    } catch {}
  }

  return new Promise((resolve, reject) => {
    chrome.cookies.getAll(
      {
        domain: domain,
      },
      (cookies) => {
        resolve(cookies);
      }
    );
  });
}

// get all cookies in current tab

function getCookies() {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll({}, (cookies) => {
      resolve(cookies);
    });
  });
}

// on tab close, clear cookies
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  chrome.cookies.getAll({}, (cookies) => {
    cookies.forEach((cookie) => {
      chrome.cookies.remove({
        url: `http${cookie.secure ? "s" : ""}://${cookie.domain}${cookie.path}`,
        name: cookie.name,
      });
    });
  });
});
// on tab update, clear cookies
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.cookies.getAll({}, (cookies) => {
    cookies.forEach((cookie) => {
      chrome.cookies.remove({
        url: `http${cookie.secure ? "s" : ""}://${cookie.domain}${cookie.path}`,
        name: cookie.name,
      });
    });
  });
});
