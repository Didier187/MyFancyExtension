const historyBtn = document.querySelector("#clear-hx");

// delete history
function deleteHistory() {
  return new Promise((resolve, reject) => {
    chrome.history.deleteAll(() => {
      location.reload();
      resolve();
    });
  });
}
historyBtn.addEventListener("click", () => {
  deleteHistory();
});
