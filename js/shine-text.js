/**
 * Split hero text into letter spans for hover shine.
 * Mark any element with data-shine-text — edit the plain text in HTML freely.
 * Letters wrap by word so names do not break mid-word.
 */

const SHINE_SELECTOR = '[data-shine-text]';
const WORD_CLASS = 'shine-word';
const LETTER_CLASS = 'shine-letter';
const SPACE_CLASS = 'shine-space';

function createLetterSpan(character) {
	const span = document.createElement('span');
	span.className = LETTER_CLASS;
	span.textContent = character;
	return span;
}

function createSpaceSpan() {
	const span = document.createElement('span');
	span.className = SPACE_CLASS;
	span.innerHTML = '&nbsp;';
	return span;
}

function createWordSpan(word) {
	const wordSpan = document.createElement('span');
	wordSpan.className = WORD_CLASS;

	Array.from(word).forEach((character) => {
		wordSpan.appendChild(createLetterSpan(character));
	});

	return wordSpan;
}

function wrapElementLetters(element) {
	const sourceText = element.textContent.replace(/\s+/g, ' ').trim();
	if (!sourceText) {
		return;
	}

	element.setAttribute('aria-label', sourceText);
	element.textContent = '';

	const tokens = sourceText.split(' ');
	tokens.forEach((word, index) => {
		element.appendChild(createWordSpan(word));
		if (index < tokens.length - 1) {
			element.appendChild(createSpaceSpan());
		}
	});
}

function initShineText() {
	document.querySelectorAll(SHINE_SELECTOR).forEach(wrapElementLetters);
}

initShineText();
