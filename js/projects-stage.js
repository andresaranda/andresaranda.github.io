/**
 * Selected work stage:
 * Desktop — sticky feature panel tracks the rail item nearest viewport center.
 * Mobile — rail items expand on tap; thumb swaps to the carousel.
 * Feature / rail media — infinite side-sliding carousel (always advances right);
 * timer pauses while hovered.
 */

const MOBILE_QUERY = '(max-width: 890px)';
const CENTER_RATIO = 0.42;
const CAROUSEL_INTERVAL_MS = 4200;
const CAROUSEL_TRANSITION = 'transform 0.75s cubic-bezier(0.22, 0.61, 0.36, 1)';

function getProjectIndex(element) {
	return Number(element.dataset.project);
}

function createCarousel(root) {
	const track = root.querySelector('.work-carousel-track');
	if (!track) {
		return null;
	}

	const originals = Array.from(track.querySelectorAll('img'));
	if (originals.length <= 1) {
		return null;
	}

	const firstClone = originals[0].cloneNode(true);
	firstClone.alt = '';
	firstClone.setAttribute('aria-hidden', 'true');
	track.appendChild(firstClone);

	const slides = Array.from(track.querySelectorAll('img'));
	const realCount = originals.length;
	const total = slides.length;
	const slidePercent = 100 / total;

	track.style.width = `${total * 100}%`;
	slides.forEach((slide) => {
		slide.style.width = `${slidePercent}%`;
		slide.style.flex = `0 0 ${slidePercent}%`;
	});

	let index = 0;
	let timerId = 0;
	let paused = false;
	let running = false;

	const clearTimer = () => {
		window.clearTimeout(timerId);
		timerId = 0;
	};

	const apply = (withTransition) => {
		track.style.transition = withTransition ? CAROUSEL_TRANSITION : 'none';
		track.style.transform = `translateX(-${index * slidePercent}%)`;
	};

	const schedule = () => {
		clearTimer();
		if (!running || paused) {
			return;
		}
		timerId = window.setTimeout(advance, CAROUSEL_INTERVAL_MS);
	};

	const advance = () => {
		clearTimer();
		if (!running || paused) {
			return;
		}
		index += 1;
		apply(true);
	};

	const onTransitionEnd = (event) => {
		if (event.target !== track || event.propertyName !== 'transform') {
			return;
		}

		if (index >= realCount) {
			index = 0;
			apply(false);
			void track.offsetHeight;
		}

		if (running && !paused) {
			schedule();
		}
	};

	track.addEventListener('transitionend', onTransitionEnd);

	const start = () => {
		if (running) {
			return;
		}
		running = true;
		paused = false;
		schedule();
	};

	const stop = () => {
		running = false;
		paused = false;
		clearTimer();
	};

	const pause = () => {
		paused = true;
		clearTimer();
	};

	const resume = () => {
		if (!running) {
			return;
		}
		paused = false;
		schedule();
	};

	const reset = () => {
		clearTimer();
		index = 0;
		apply(false);
		void track.offsetHeight;
		if (running && !paused) {
			schedule();
		}
	};

	const isRunning = () => running;

	root.addEventListener('mouseenter', pause);
	root.addEventListener('mouseleave', resume);
	root.addEventListener('focusin', pause);
	root.addEventListener('focusout', (event) => {
		if (!root.contains(event.relatedTarget)) {
			resume();
		}
	});

	apply(false);

	return { start, stop, reset, pause, resume, isRunning };
}

function syncCarousels(carousels, index, { mobile = false, expandMobile = false } = {}) {
	carousels.forEach((entry) => {
		const { carousel, project, context } = entry;
		const shouldRun =
			project === index &&
			((!mobile && context === 'feature') ||
				(mobile && expandMobile && context === 'rail'));

		if (shouldRun) {
			const kick = () => {
				if (!carousel.isRunning()) {
					carousel.reset();
					carousel.start();
				}
			};
			// Rail carousels are display:none until expanded — wait a frame for layout
			if (mobile && context === 'rail') {
				window.requestAnimationFrame(kick);
			} else {
				kick();
			}
		} else if (carousel.isRunning()) {
			carousel.stop();
		}
	});
}

function setActiveProject(root, index, carousels, { expandMobile = false } = {}) {
	const mobile = window.matchMedia(MOBILE_QUERY).matches;
	const featurePanels = root.querySelectorAll('.work-feature-panel');
	const railItems = root.querySelectorAll('.work-rail-item');

	featurePanels.forEach((panel) => {
		panel.classList.toggle('is-active', getProjectIndex(panel) === index);
	});

	railItems.forEach((item) => {
		const isActive = getProjectIndex(item) === index;
		item.classList.toggle('is-active', isActive);

		if (mobile) {
			item.classList.toggle('is-expanded', expandMobile && isActive);
		} else {
			item.classList.remove('is-expanded');
		}
	});

	syncCarousels(carousels, index, { mobile, expandMobile });
}

function findCenteredRailIndex(railItems) {
	const targetY = window.innerHeight * CENTER_RATIO;
	let bestIndex = 0;
	let bestDistance = Infinity;

	railItems.forEach((item) => {
		const rect = item.getBoundingClientRect();
		const itemCenter = rect.top + rect.height / 2;
		const distance = Math.abs(itemCenter - targetY);

		if (distance < bestDistance) {
			bestDistance = distance;
			bestIndex = getProjectIndex(item);
		}
	});

	return bestIndex;
}

function scrollRailItemToCenter(item) {
	const rect = item.getBoundingClientRect();
	const itemCenter = rect.top + window.scrollY + rect.height / 2;
	const targetScroll = itemCenter - window.innerHeight * CENTER_RATIO;

	window.scrollTo({
		top: Math.max(0, targetScroll),
		behavior: 'smooth',
	});
}

function easeInOutCubic(t) {
	return t < 0.5 ? 4 * t * t * t : 1 - (Math.pow(-2 * t + 2, 3) / 2);
}

function animateScrollTo(targetY, durationMs) {
	const startY = window.scrollY || window.pageYOffset || 0;
	const delta = targetY - startY;

	if (Math.abs(delta) < 1) {
		return;
	}

	let startTime = null;

	const frame = (now) => {
		if (startTime === null) {
			startTime = now;
		}
		const t = Math.min((now - startTime) / durationMs, 1);
		window.scrollTo(0, startY + delta * easeInOutCubic(t));
		if (t < 1) {
			window.requestAnimationFrame(frame);
		} else {
			window.scrollTo(0, targetY);
		}
	};

	window.requestAnimationFrame(frame);
}

function getExpandedScrollTarget(item, railItems) {
	const margin = 20;
	const viewport = window.innerHeight;
	const scrollY = window.scrollY || window.pageYOffset || 0;
	const rect = item.getBoundingClientRect();
	const expandInner = item.querySelector('.work-rail-expand-inner');
	const expandExtra = expandInner ? expandInner.scrollHeight + 14 : 0;

	// Other open items above this one will collapse, shifting this item upward
	let collapseAbove = 0;
	railItems.some((other) => {
		if (other === item) {
			return true;
		}
		if (other.classList.contains('is-expanded')) {
			const otherInner = other.querySelector('.work-rail-expand-inner');
			if (otherInner) {
				collapseAbove += otherInner.scrollHeight + 14;
			}
		}
		return false;
	});

	const itemTopAfter = scrollY + rect.top - collapseAbove;
	const predictedHeight = rect.height + expandExtra;
	const available = viewport - margin * 2;

	let nextY;
	if (predictedHeight <= available) {
		nextY = itemTopAfter - (viewport - predictedHeight) / 2;
	} else {
		nextY = itemTopAfter - margin;
	}

	return Math.max(0, nextY);
}

function initDesktopStage(root, railItems, carousels) {
	let activeIndex = 0;
	let ticking = false;

	const syncFromScroll = () => {
		const sectionRect = root.getBoundingClientRect();
		const sectionVisible =
			sectionRect.top < window.innerHeight * 0.85 &&
			sectionRect.bottom > window.innerHeight * 0.15;

		if (sectionVisible) {
			const nextIndex = findCenteredRailIndex(railItems);
			if (nextIndex !== activeIndex) {
				activeIndex = nextIndex;
				setActiveProject(root, activeIndex, carousels);
			}
		}
		ticking = false;
	};

	const onScroll = () => {
		if (ticking) {
			return;
		}
		ticking = true;
		window.requestAnimationFrame(syncFromScroll);
	};

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll);
	setActiveProject(root, activeIndex, carousels);
	syncFromScroll();

	railItems.forEach((item) => {
		item.addEventListener('click', (event) => {
			if (event.target.closest('a')) {
				return;
			}
			scrollRailItemToCenter(item);
		});

		item.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				scrollRailItemToCenter(item);
			}
		});
	});

	return () => {
		window.removeEventListener('scroll', onScroll);
		window.removeEventListener('resize', onScroll);
		carousels.forEach((entry) => entry.carousel.stop());
	};
}

function initMobileStage(root, railItems, carousels) {
	let activeIndex = 0;

	carousels.forEach((entry) => entry.carousel.stop());
	setActiveProject(root, activeIndex, carousels, { expandMobile: false });

	const onClick = (event) => {
		if (event.target.closest('a')) {
			return;
		}

		const item = event.currentTarget;
		const index = getProjectIndex(item);
		const shouldExpand = !(item.classList.contains('is-expanded') && index === activeIndex);

		activeIndex = index;

		if (shouldExpand) {
			const targetY = getExpandedScrollTarget(item, railItems);
			setActiveProject(root, activeIndex, carousels, { expandMobile: true });
			animateScrollTo(targetY, 450);
		} else {
			setActiveProject(root, activeIndex, carousels, { expandMobile: false });
		}
	};

	const onKeydown = (event) => {
		if (event.key !== 'Enter' && event.key !== ' ') {
			return;
		}
		event.preventDefault();
		onClick(event);
	};

	railItems.forEach((item) => {
		item.addEventListener('click', onClick);
		item.addEventListener('keydown', onKeydown);
	});

	return () => {
		railItems.forEach((item) => {
			item.removeEventListener('click', onClick);
			item.removeEventListener('keydown', onKeydown);
		});
		carousels.forEach((entry) => entry.carousel.stop());
	};
}

function initProjectsStage() {
	const root = document.querySelector('.work-section');
	if (!root) {
		return;
	}

	const railItems = Array.from(root.querySelectorAll('.work-rail-item'));
	if (railItems.length === 0) {
		return;
	}

	const carousels = [];
	root.querySelectorAll('[data-carousel]').forEach((carouselRoot) => {
		const host = carouselRoot.closest('[data-project]');
		if (!host) {
			return;
		}
		const carousel = createCarousel(carouselRoot);
		if (!carousel) {
			return;
		}
		carousels.push({
			carousel,
			project: getProjectIndex(host),
			context: carouselRoot.dataset.carouselContext || 'feature',
		});
	});

	const media = window.matchMedia(MOBILE_QUERY);
	let teardown = null;

	const setup = () => {
		if (teardown) {
			teardown();
			teardown = null;
		}

		if (media.matches) {
			teardown = initMobileStage(root, railItems, carousels);
		} else {
			teardown = initDesktopStage(root, railItems, carousels);
		}
	};

	setup();
	media.addEventListener('change', setup);
}

initProjectsStage();
