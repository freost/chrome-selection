(() => {
	/**
	 * @type {HTMLDivElement|null}
	 */
	let selectionDiv = null;

	/**
	 * @type {string}
	 */
	let highlightedText = "";

	/**
	 * Adds a hover effect to the target element.
	 *
	 * @param {HTMLElement} target
	 * @returns {void}
	 */
	function addHoverEffect(target) {
		target.addEventListener("mouseenter", () => {
			target.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
		});

		target.addEventListener("mouseleave", () => {
			target.style.backgroundColor = "";
		});
	}

	/**
	 * Creates a div element that will be displayed over the selected text.
	 *
	 * @param {DOMRect} rect
	 * @returns {HTMLDivElement}
	 */
	function createSelectionDiv(rect) {
		// Create the div and the shadow root

		const div = document.createElement("div");
		const shadowRoot = div.attachShadow({ mode: "open" });

		// Create the popover div

		const popover = document.createElement("div");

		popover.style.cssText = `
		all: initial;
		z-index: 99999;
		position: absolute;
		display: block;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
		font-size: 14px;
		padding: 2px;
		border-radius: 5px;
		background-color: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(2px);
		box-shadow: 2px 11px 10px -6px rgba(0, 0, 0, 0.5);
		color: rgb(255, 255, 255);
		`;

		// Button styles

		const buttonStyles = `
		display: inline-block;
		cursor: pointer;
		padding: 4px;
		border-radius: 5px;
		`;

		// Create the search span

		const searchSpan = document.createElement("span");

		searchSpan.textContent = chrome.i18n.getMessage("search");

		searchSpan.style.cssText = buttonStyles;

		addHoverEffect(searchSpan);

		searchSpan.addEventListener("click", () => {
			chrome.runtime.sendMessage({
				action: "search",
				query: highlightedText,
			});
		});

		popover.appendChild(searchSpan);

		// Create divider

		const divider = document.createElement("span");

		divider.style.cssText = `
		margin-left: 4px;
		margin-right: 4px;
		border-left: 1px solid rgba(255, 255, 255, 0.25);
		`;

		popover.appendChild(divider);

		// Create the copy span

		const copySpan = document.createElement("span");

		copySpan.textContent = chrome.i18n.getMessage("copy");

		copySpan.style.cssText = buttonStyles;

		addHoverEffect(copySpan);

		copySpan.addEventListener("click", () => {
			navigator.clipboard.writeText(highlightedText);
			removeSelectionDiv();
		});

		popover.appendChild(copySpan);

		// Append the popover to the shadow root

		shadowRoot.appendChild(popover);

		// Append the div to the body

		document.body.appendChild(div);

		// Position the popover

		const margin = 8;

		let top = rect.top - popover.offsetHeight - margin;

		if (top < 0) {
			top = rect.bottom + margin;
		}

		const left = Math.max(
			margin,
			Math.min(
				rect.left - popover.offsetWidth / 2 + rect.width / 2,
				window.innerWidth - popover.offsetWidth - margin,
			),
		);

		popover.style.top = top + window.scrollY + "px";
		popover.style.left = left + window.scrollX + "px";

		return div;
	}

	/**
	 * Removes the selection div from the DOM
	 *
	 * @returns {void}
	 */
	function removeSelectionDiv() {
		if (selectionDiv) {
			selectionDiv.remove();
			selectionDiv = null;
		}
	}

	/**
	 * Checks if the user has highlighted some text and creates a div element
	 * that will be displayed over the selected text.
	 *
	 * @param {MouseEvent} e
	 * @returns {void}
	 */
	function checkTextHighlight(e) {
		// Check if the event target is the selection div to prevent it from being removed

		if (e.target === selectionDiv) {
			return;
		}

		removeSelectionDiv();

		// Check if the user has highlighted some text and create the selection div if needed

		const selection = window.getSelection();

		if (selection.toString().trim().length > 0) {
			highlightedText = selection.toString();

			selectionDiv = createSelectionDiv(
				selection.getRangeAt(0).getBoundingClientRect(),
			);
		} else {
			highlightedText = "";
		}
	}

	// Check if the user has highlighted some text when the mouse button is released

	document.addEventListener("mouseup", checkTextHighlight);

	// Remove the selection div when the user scrolls, changes tab, presses a key or resizes the window

	document.addEventListener("scroll", removeSelectionDiv);
	document.addEventListener("visibilitychange", removeSelectionDiv);
	document.addEventListener("keydown", removeSelectionDiv);
	window.addEventListener("resize", removeSelectionDiv);
})();
