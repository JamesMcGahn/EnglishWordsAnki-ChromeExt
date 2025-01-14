chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.create({
    title: "Save to word to EnglishWordsAnki",
    id: "contextMenu1",
    contexts: ["page", "selection"],
  });

  chrome.contextMenus.onClicked.addListener((event) => {
    if (event.menuItemId === "contextMenu1") {
      sendData(event);
    }
  });
});

function getEndpoint() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["endpoint"], (res) => {
      resolve(res.endpoint ?? "http://127.0.0.1:5000/word");
    });
  });
}

async function sendData(event) {
  const url = await getEndpoint();
  const data = {
    word: `${event.selectionText}`,
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        sendUserMessage(
          `Failed to send ${data.word}. Make sure desktop application is opened and endpoint is correct.`,
        );
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);
      this.registration.showNotification("EnglishDict Extension", {
        body: `${data.word} was sent to EnglishDict Successfully`,
        icon: "icon.png",
      });
    })
    .catch((error) => {
      if (error instanceof TypeError && error?.message === "Failed to fetch") {
        sendUserMessage(
          `Failed to send ${data.word}. Make sure desktop application is opened and endpoint is correct.`,
        );
      }
      console.error("Error:", error);
    });
}

function sendUserMessage(msg) {
  this.registration.showNotification("EnglishDict Extension", {
    body: msg,
    icon: "icon.png",
  });
}
