
// Cloud effect is only activated if Ripple effect is not available

const grid = document.querySelector('.grid-1');
const clouds = document.querySelectorAll('.cloud')

const cloud_1 = {
	id: 'cloud-1',
	loop_duration: 60, // s
	top_min: -10, // %
	top_max: 25, // %
	height_min: 25, // %
	height_max: 45 // %
}
const cloud_2 = {
	id: 'cloud-2',
	loop_duration: 40, // s
	top_min: 25, // %
	top_max: 50, // %
	height_min: 25, // %
	height_max: 45 // %
}
const cloud_config = [cloud_1, cloud_2]

function resetCloud(cloud){
	cloud.style.transitionDuration = '0s'
	cloud.classList.remove('cloud-move')
}

function moveCloud(cloud, cloud_params){
	const cloud_top = cloud_params.top_min + Math.round((cloud_params.top_max - cloud_params.top_min) * Math.random())
	const cloud_height = cloud_params.height_min + Math.round((cloud_params.height_max - cloud_params.height_min) * Math.random())
	cloud.style.top = `${cloud_top}%`
	cloud.style.height = `${cloud_height}%`
	cloud.style.transitionDuration = `${cloud_params.loop_duration}s`
	cloud.classList.add('cloud-move')
}

function cloudEffect(clouds, cloud_config){
	moveCloud(clouds[0], cloud_config[0])
	moveCloud(clouds[1], cloud_config[1])
	window.setInterval(function (){ resetCloud(clouds[0], cloud_config[0]) }, cloud_config[0].loop_duration * 1000 - 10)
	window.setInterval(function (){ resetCloud(clouds[1], cloud_config[1]) }, cloud_config[1].loop_duration * 1000 - 10)
	window.setInterval(function (){ moveCloud(clouds[0], cloud_config[0]) }, cloud_config[0].loop_duration * 1000)
	window.setInterval(function (){ moveCloud(clouds[1], cloud_config[1]) }, cloud_config[1].loop_duration * 1000)
}

function webglSupport(){ 
	try {
	 var canvas = document.createElement('canvas'); 
	 return !!window.WebGLRenderingContext &&
	   (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
	} catch(e) {
	  return false;
	}
};

function rippleEffect(){
	$(document).ready(function() {
		try {
			$('.water-effect').ripples({
				dropRadius: 15,
				resolution: 700,
				perturbance: 0.006
			});
		}
		catch (e) {
			$('.error').show().text(e);
		};
	});
}

const toggleOptions = {
    root: null, //default
    threshold: 0, //default
    rootMargin: "0px 0px 0px 0px" //default
};

const toggleWaterEffect = new IntersectionObserver((entries, toggleWaterEffect) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
			rippleEffect();
        } else {
			$('.water-effect').ripples('destroy')
		};
    });
}, toggleOptions);

if (webglSupport()){
	toggleWaterEffect.observe(grid);
} else {
	cloudEffect(clouds, cloud_config)
};
