let contextMenuCreated = false;
let clickListenerAdd = false;

chrome.runtime.onInstalled.addListener((details) => {
  createContextMenu();
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenu();
});

function createContextMenu() {
  if (!contextMenuCreated) {
    chrome.contextMenus.create({
      title: "Save to word to EnglishWordsAnki",
      id: "contextMenu1",
      contexts: ["selection"],
    });
    contextMenuCreated = true;
  }

  if (!clickListenerAdd) {
    chrome.contextMenus.onClicked.addListener((event) => {
      if (event.menuItemId === "contextMenu1") {
        sendData(event);
        console.log("click");
      }
    });
    clickListenerAdd = true;
  }
}

async function getEndpoint() {
  try {
    const res = await new Promise((resolve) => {
      chrome.storage.sync.get(["endpoint"], (res) => {
        resolve(res.endpoint);
      });
    });
    return res ?? "http://127.0.0.1:5000/word";
  } catch (err) {
    console.log("Error retrieving endpoint from storage", err);
  }
}

async function sendData(event) {
  if (!event.selectionText || event.selectionText.trim() === "") {
    sendUserMessage("No text was selected to send.");
    return;
  }

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
      sendUserMessage(`${data.word} was sent to EnglishDict Successfully`);
    })
    .catch((error) => {
      if (error instanceof TypeError && error?.message === "Failed to fetch") {
        sendUserMessage(
          `Failed to send ${data.word}. Make sure desktop application is opened and endpoint is correct.`,
        );
      }
      console.log("Error:", error);
    });
}

function sendUserMessage(msg) {
  self.registration.showNotification("EnglishDict Extension", {
    body: msg,
    icon: "icon.png",
  });
}
