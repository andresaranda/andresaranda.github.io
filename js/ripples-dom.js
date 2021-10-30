
const grid = document.querySelector('.grid-1');

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
};
