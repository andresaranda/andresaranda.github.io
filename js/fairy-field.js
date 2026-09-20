/**
 * Fairy field + zone bounds inside .site-body.
 *
 * Bounds:
 * - Field: contact section top → footer bottom
 * - Roam left/right: each half of the field, bottom 75% height
 * - Hunter: bottom 50% of the field, left ≥ mid-section, right ≤ cat center,
 *   bottom edge above the cat
 *
 * Motion: each fairy tours a grid of its zone (every cell once, then reshuffle).
 * Long quadrant hops take priority; optional short pauses in-cell are secondary.
 */

const GRID_COLS = 2;
const GRID_ROWS = 2;

const FAIRY_CONFIG = {
	hunter: {
		selector: '.fairy-light--hunter',
		minDuration: 4.5,
		maxDuration: 7.5,
		pauseMin: 0.4,
		pauseMax: 1.2,
	},
	left: {
		selector: '.fairy-light--a',
		minDuration: 5.5,
		maxDuration: 9,
		pauseMin: 0.5,
		pauseMax: 1.4,
	},
	right: {
		selector: '.fairy-light--b',
		minDuration: 6,
		maxDuration: 10,
		pauseMin: 0.5,
		pauseMax: 1.6,
	},
};

function getPageY(el) {
	return el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
}

function randomBetween(min, max) {
	return min + Math.random() * (max - min);
}

function shuffleInPlace(items) {
	for (let i = items.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = items[i];
		items[i] = items[j];
		items[j] = temp;
	}
	return items;
}

function buildCellQueue(cols, rows) {
	const cells = [];
	for (let row = 0; row < rows; row += 1) {
		for (let col = 0; col < cols; col += 1) {
			cells.push({ row, col });
		}
	}
	return shuffleInPlace(cells);
}

function pointInCell(cell, zoneWidth, zoneHeight, cols, rows) {
	const cellWidth = zoneWidth / cols;
	const cellHeight = zoneHeight / rows;
	const insetX = cellWidth * 0.18;
	const insetY = cellHeight * 0.18;

	return {
		x: cell.col * cellWidth + insetX + Math.random() * (cellWidth - insetX * 2),
		y: cell.row * cellHeight + insetY + Math.random() * (cellHeight - insetY * 2),
	};
}

function updateFairyFieldBounds() {
	const body = document.querySelector('.site-body');
	const contact = document.getElementById('contact');
	const field = document.querySelector('.fairy-field');
	const hunterZone = document.querySelector('.fairy-zone--hunter');
	const cat = document.querySelector('.cat-img');

	if (!body || !contact || !field) {
		return;
	}

	const bodyTop = getPageY(body);
	const contactTop = getPageY(contact);
	body.style.setProperty('--fairy-field-top', `${Math.max(0, contactTop - bodyTop)}px`);

	if (!hunterZone || !cat) {
		return;
	}

	const fieldRect = field.getBoundingClientRect();
	const catRect = cat.getBoundingClientRect();

	if (fieldRect.height < 8 || fieldRect.width < 8) {
		return;
	}

	const leftBound = fieldRect.width * 0.5;
	const catCenterX = catRect.left + catRect.width / 2 - fieldRect.left;
	const rightBound = Math.min(fieldRect.width, catCenterX);
	const zoneWidth = Math.max(0, rightBound - leftBound);

	const topBound = fieldRect.height * 0.5;
	const catTopInField = catRect.top - fieldRect.top;
	const bottomBound = Math.min(fieldRect.height, catTopInField - 6);
	const zoneHeight = Math.max(0, bottomBound - topBound);

	hunterZone.style.left = `${Math.round(leftBound)}px`;
	hunterZone.style.width = `${Math.round(zoneWidth)}px`;
	hunterZone.style.top = `${Math.round(topBound)}px`;
	hunterZone.style.height = `${Math.round(zoneHeight)}px`;
	hunterZone.style.bottom = 'auto';
}

function createFairyWanderer(fairy, config) {
	const zone = fairy.parentElement;
	let cellQueue = [];
	let timerId = 0;
	let destroyed = false;

	fairy.style.animation = 'none';
	fairy.style.willChange = 'left, top, transform, opacity';

	function zoneSize() {
		return {
			width: Math.max(1, zone.clientWidth),
			height: Math.max(1, zone.clientHeight),
		};
	}

	function nextCellPoint() {
		if (!cellQueue.length) {
			cellQueue = buildCellQueue(GRID_COLS, GRID_ROWS);
		}
		const cell = cellQueue.shift();
		const { width, height } = zoneSize();
		return pointInCell(cell, width, height, GRID_COLS, GRID_ROWS);
	}

	function place(point, durationSec) {
		const { width, height } = zoneSize();
		const x = Math.min(Math.max(point.x, 0), width);
		const y = Math.min(Math.max(point.y, 0), height);
		const scale = randomBetween(0.92, 1.14);
		const opacity = randomBetween(0.55, 1);

		fairy.style.transition = [
			`left ${durationSec}s ease-in-out`,
			`top ${durationSec}s ease-in-out`,
			`transform ${durationSec}s ease-in-out`,
			`opacity ${durationSec * 0.85}s ease-in-out`,
		].join(', ');
		fairy.style.left = `${x}px`;
		fairy.style.top = `${y}px`;
		fairy.style.transform = `scale(${scale})`;
		fairy.style.opacity = String(opacity);
	}

	function scheduleNext(delayMs) {
		window.clearTimeout(timerId);
		timerId = window.setTimeout(step, delayMs);
	}

	function step() {
		if (destroyed) {
			return;
		}

		const duration = randomBetween(config.minDuration, config.maxDuration);
		place(nextCellPoint(), duration);

		const pause = randomBetween(config.pauseMin, config.pauseMax);
		scheduleNext((duration + pause) * 1000);
	}

	function start() {
		const { width, height } = zoneSize();
		const startPoint = pointInCell(
			{ row: Math.floor(Math.random() * GRID_ROWS), col: Math.floor(Math.random() * GRID_COLS) },
			width,
			height,
			GRID_COLS,
			GRID_ROWS
		);
		fairy.style.transition = 'none';
		fairy.style.left = `${startPoint.x}px`;
		fairy.style.top = `${startPoint.y}px`;
		fairy.style.transform = 'scale(1)';
		fairy.style.opacity = '0.8';

		// Kick off after layout settles; stagger each fairy slightly
		scheduleNext(randomBetween(200, 1200));
	}

	function stop() {
		destroyed = true;
		window.clearTimeout(timerId);
	}

	return { start, stop, step };
}

function initFairyField() {
	updateFairyFieldBounds();

	const wanderers = Object.values(FAIRY_CONFIG)
		.map((config) => {
			const fairy = document.querySelector(config.selector);
			if (!fairy) {
				return null;
			}
			return createFairyWanderer(fairy, config);
		})
		.filter(Boolean);

	wanderers.forEach((wanderer) => wanderer.start());

	let resizeTimer = 0;
	window.addEventListener('resize', () => {
		window.clearTimeout(resizeTimer);
		resizeTimer = window.setTimeout(() => {
			updateFairyFieldBounds();
		}, 120);
	});

	window.addEventListener('load', updateFairyFieldBounds);

	if (typeof ResizeObserver !== 'undefined') {
		const body = document.querySelector('.site-body');
		if (body) {
			new ResizeObserver(() => {
				updateFairyFieldBounds();
			}).observe(body);
		}
	}
}

initFairyField();
