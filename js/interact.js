
const nav = document.querySelector('#nav-under-logo');
const image_top = document.querySelector('#image-top');
const nav_contact_link_1 = document.querySelector('#nav-contact-link-1');
const nav_contact_link_2 = document.querySelector('#nav-contact-link-2');
const ham_btn = document.querySelector('.hamburger-btn');
const nav_toggle = document.querySelector('#nav-toggle');
const faders = document.querySelectorAll(".fade-in");

let pos_navbar = nav.offsetTop + 0; //based on parent element (currently body)
window.addEventListener('scroll', () => {
    if (window.pageYOffset >= pos_navbar){
        nav.classList.add('sticky');
        image_top.classList.add('sticky-margin');
        nav_contact_link_1.classList.remove('hidden');
        nav_contact_link_2.classList.remove('hidden');
    } else {
        nav.classList.remove('sticky');
        image_top.classList.remove('sticky-margin');
        nav_contact_link_1.classList.add('hidden');
        nav_contact_link_2.classList.add('hidden');
    };
});


ham_btn.addEventListener('click', () => { nav_toggle.classList.toggle('activated-ham-menu') });

window.addEventListener('click', (event) => {
    if (!(event.target.classList.contains('hamburger-btn')) && (event.target.id !== 'nav-list')){
        nav_toggle.classList.remove('activated-ham-menu');
    };
});


let text_canastas = document.querySelector('#image-canastas .text-over-img').textContent;
let text_tablas = document.querySelector('#image-tablas .text-over-img').textContent;
let text_nosotros = document.querySelector('#image-nosotros .text-over-img').textContent;
document.querySelector('#image-canastas-text').textContent = text_canastas;
document.querySelector('#image-tablas-text').textContent = text_tablas;
document.querySelector('#image-nosotros-text').textContent = text_nosotros;


const appearOptions = {
    root: null, //default
    threshold: 0, //default
    rootMargin: "0px 0px -250px 0px"
};

const appearOnScroll = new IntersectionObserver((entries, appearOnScroll) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("appear");
            appearOnScroll.unobserve(entry.target);
        };
    });
}, appearOptions);
  
faders.forEach(fader => {
    appearOnScroll.observe(fader);
});