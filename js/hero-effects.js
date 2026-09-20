/**
 * Hero atmosphere: WebGL water ripples when available, drifting clouds otherwise.
 */

const HERO_SELECTOR = '.hero';
const WATER_SELECTOR = '.water-effect';
const CLOUD_SELECTOR = '.cloud';

const CLOUD_PRESETS = [
	{
		loopDurationSec: 60,
		topMinPercent: -10,
		topMaxPercent: 25,
		heightMinPercent: 25,
		heightMaxPercent: 45,
	},
	{
		loopDurationSec: 40,
		topMinPercent: 25,
		topMaxPercent: 50,
		heightMinPercent: 25,
		heightMaxPercent: 45,
	},
];

const RIPPLE_OPTIONS = {
	dropRadius: 15,
	resolution: 700,
	perturbance: 0.006,
};

function randomBetween(min, max) {
	return min + Math.round((max - min) * Math.random());
}

function supportsWebGL() {
	try {
		const canvas = document.createElement('canvas');
		return Boolean(
			window.WebGLRenderingContext &&
			(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
		);
	} catch (error) {
		return false;
	}
}

function resetCloudPosition(cloud) {
	cloud.style.transitionDuration = '0s';
	cloud.classList.remove('cloud-move');
}

function moveCloud(cloud, preset) {
	cloud.style.top = `${randomBetween(preset.topMinPercent, preset.topMaxPercent)}%`;
	cloud.style.height = `${randomBetween(preset.heightMinPercent, preset.heightMaxPercent)}%`;
	cloud.style.transitionDuration = `${preset.loopDurationSec}s`;
	cloud.classList.add('cloud-move');
}

function startCloudLoop(cloud, preset) {
	const loopMs = preset.loopDurationSec * 1000;

	moveCloud(cloud, preset);
	window.setInterval(() => resetCloudPosition(cloud), loopMs - 10);
	window.setInterval(() => moveCloud(cloud, preset), loopMs);
}

function startCloudEffect(clouds, presets) {
	clouds.forEach((cloud, index) => {
		const preset = presets[index];
		if (!preset) {
			return;
		}
		startCloudLoop(cloud, preset);
	});
}

function createRipples($water) {
	try {
		$water.ripples(RIPPLE_OPTIONS);
	} catch (error) {
		console.warn('Water ripples unavailable:', error);
	}
}

function destroyRipples($water) {
	try {
		$water.ripples('destroy');
	} catch (error) {
		// Plugin may already be inactive when the hero leaves the viewport.
	}
}

function observeWaterEffect(heroElement) {
	const $water = $(WATER_SELECTOR);

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				createRipples($water);
			} else {
				destroyRipples($water);
			}
		});
	});

	observer.observe(heroElement);
}

function initHeroEffects() {
	const heroElement = document.querySelector(HERO_SELECTOR);
	if (!heroElement) {
		return;
	}

	if (supportsWebGL()) {
		observeWaterEffect(heroElement);
		return;
	}

	const clouds = document.querySelectorAll(CLOUD_SELECTOR);
	startCloudEffect(clouds, CLOUD_PRESETS);
}

initHeroEffects();
