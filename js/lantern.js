
let lantern_overlay = document.querySelector('.lantern_overlay');

function getTopCoordinate(elem) { // crossbrowser version
    const box = elem.getBoundingClientRect();
    const body = document.body;
    const docEl = document.documentElement;
    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const clientTop = docEl.clientTop || body.clientTop || 0;
    const top  = box.top +  scrollTop - clientTop;

    return Math.round(top);
}

let top_coordinate = getTopCoordinate(lantern_overlay)
window.addEventListener('resize', () => {top_coordinate = getTopCoordinate(lantern_overlay)})

lantern_overlay.addEventListener('mousemove', e => {
	let x = e.pageX;
	let y = e.pageY - top_coordinate;
	lantern_overlay.style.setProperty('--x', x + 'px');
	lantern_overlay.style.setProperty('--y', y + 'px');
});