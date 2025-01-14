chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.create({
    title: "Save to word to EnglishWordsAnki",
    id: "contextMenu1",
    contexts: ["page", "selection"],
  });

  chrome.contextMenus.onClicked.addListener((event) => {
    if (event.menuItemId === "contextMenu1") {
      let endpoint;
      chrome.storage.sync.get(["endpoint"], (res) => {
        endpoint = res.endpoint ?? "http://127.0.0.1:5000/word";
      });
      const url = endpoint;
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
          if (
            error instanceof TypeError &&
            error?.message === "Failed to fetch"
          ) {
            this.registration.showNotification("EnglishDict Extension", {
              body: `Failed to send ${data.word}. Make sure desktop application is opened and endpoint is correct.`,
              icon: "icon.png",
            });
          }
          console.log("Error:", error);
        });
    }
  });
});
