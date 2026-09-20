/**
 * Hero scroll-cue: custom eased scroll.
 *
 * Important: each frame must use behavior "instant"/"auto".
 * If html { scroll-behavior: smooth } is active, every scrollTo()
 * would start its own smooth animation and the rAF curve never applies.
 */

const DURATION_MS = 900;

/** CSS-like ease: slow start, faster middle, soft landing. */
function easeInOutCubic(t) {
	return t < 0.5
		? 4 * t * t * t
		: 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getScrollY() {
	return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
}

function setScrollY(y) {
	// Two-arg form is always instant and ignores css scroll-behavior
	window.scrollTo(0, y);
}

function smoothScrollToY(targetY, duration, easing) {
	const startY = getScrollY();
	const delta = targetY - startY;

	if (Math.abs(delta) < 1) {
		return;
	}

	let startTime = null;

	function frame(now) {
		if (startTime === null) {
			startTime = now;
		}

		const elapsed = now - startTime;
		const t = Math.min(elapsed / duration, 1);
		const nextY = startY + delta * easing(t);

		setScrollY(nextY);

		if (t < 1) {
			window.requestAnimationFrame(frame);
		} else {
			setScrollY(targetY);
		}
	}

	window.requestAnimationFrame(frame);
}

function initSmoothScrollCue() {
	const cue = document.querySelector('.scroll-cue');
	if (!cue) {
		return;
	}

	cue.addEventListener('click', (event) => {
		const href = cue.getAttribute('href');
		if (!href || href.charAt(0) !== '#') {
			return;
		}

		const target = document.querySelector(href);
		if (!target) {
			return;
		}

		event.preventDefault();

		const targetY = Math.round(
			target.getBoundingClientRect().top + getScrollY()
		);

		smoothScrollToY(targetY, DURATION_MS, easeInOutCubic);
	});
}

initSmoothScrollCue();
