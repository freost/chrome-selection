chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "search" && request.query) {
		chrome.search.query({ text: request.query, disposition: "NEW_TAB" });
	}
});
