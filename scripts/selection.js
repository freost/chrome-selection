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
	// Create the div

	const div = document.createElement("div");

	const left = rect.left + window.scrollX;
	const top = rect.top + window.scrollY - 44;

	div.style.cssText = `
    z-index: 1000;
    position: absolute;
    display: block;
    top: ${top}px;
    left: ${left}px;
    font-size: 14px;
    padding: 2px;
    border-radius: 5px;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(2px);
    color: white;
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

	searchSpan.textContent = "Search";

	searchSpan.style.cssText = buttonStyles;

	addHoverEffect(searchSpan);

	searchSpan.addEventListener("click", () => {
		chrome.runtime.sendMessage({
			action: "search",
			query: highlightedText,
		});
	});

	div.appendChild(searchSpan);

	// Create divider

	const divider = document.createElement("span");

	divider.textContent = "|";

	divider.style.cssText = `
    opacity: 0.5;
    padding: 2px;
	`;

	div.appendChild(divider);

	// Create the copy span

	const copySpan = document.createElement("span");

	copySpan.textContent = "Copy";

	copySpan.style.cssText = buttonStyles;

	addHoverEffect(copySpan);

	copySpan.addEventListener("click", () => {
		navigator.clipboard.writeText(highlightedText);
		removeSelectionDiv();
	});

	div.appendChild(copySpan);

	document.body.appendChild(div);

	return div;
}

/**
 * Removes the selection div from the DOM
 *
 * @returns {void}
 */
function removeSelectionDiv() {
	if (selectionDiv) {
		document.body.removeChild(selectionDiv);
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
	// Check if the event target is a child of the selection div to prevent it from being removed

	if (e.target.parentElement === selectionDiv) {
		return;
	}

	removeSelectionDiv();

	// Check if the user has highlighted some text and create the selection div if needed

	const selection = window.getSelection();

	if (selection.toString().length > 0) {
		highlightedText = selection.toString();

		selectionDiv = createSelectionDiv(
			selection.getRangeAt(0).getBoundingClientRect()
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
