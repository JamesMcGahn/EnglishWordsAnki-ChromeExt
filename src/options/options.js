const endpointInput = document.getElementById("endpoint");
const saveBtn = document.getElementById("save-btn");

saveBtn.addEventListener("click", () => {
  console.log(endpointInput.value);
  const endpoint = endpointInput.value;

  chrome.storage.sync.set({ endpoint });
});
chrome.storage.sync.get(["endpoint"], (res) => {
  endpointInput.value = res.endpoint ?? "http://127.0.0.1:5000/word";
});
