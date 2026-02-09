const PALETTE = [
  { color: '#F41C40', weight: 12 },
  { color: '#990000', weight: 8 },
  { color: '#6D0808', weight: 3 },
  { color: '#EEEEF0', weight: 3 },
  { color: '#072332', weight: 1 }
];

function weightedColor() {
  const total = PALETTE.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * total;
  for (const c of PALETTE) {
    if ((r -= c.weight) <= 0) return c.color;
  }
}

const background = document.querySelector('.background');
const nav = document.getElementById('nav');
const caret = document.getElementById('scrollCaret');
const toTop = document.getElementById('toTop');
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav a');

let energy = 0;
let mx = window.innerWidth / 2;
let my = window.innerHeight / 2;

function createField(type = 'color') {
  const el = document.createElement('div');
  el.className = type === 'dark' ? 'field dark' : 'field';

  el.style.background = type === 'dark'
    ? `radial-gradient(circle at var(--gx,50%) var(--gy,50%), #000, #050a10 45%, transparent 70%)`
    : `radial-gradient(circle at var(--gx,50%) var(--gy,50%), ${weightedColor()}, ${weightedColor()} 45%, transparent 70%)`;

  background.appendChild(el);

  return {
    el,
    x: Math.random() * 100,
    y: Math.random() * 100,
    tx: Math.random() * 100,
    ty: Math.random() * 100,
    speed: 0.01 + Math.random() * 0.015
  };
}

const fields = [
  ...Array.from({ length: 3 }, () => createField('color')),
  ...Array.from({ length: 3 }, () => createField('dark'))
];

document.addEventListener('mousemove', e => {
  const dx = e.clientX - mx;
  const dy = e.clientY - my;
  mx = e.clientX;
  my = e.clientY;
  energy = Math.min(energy + Math.hypot(dx, dy) * 0.002, 2.5);
});

window.addEventListener('scroll', () => {
  const y = window.scrollY;

  caret.style.opacity = y < 50 ? '1' : '0';
  nav.classList.toggle('visible', y > window.innerHeight * 0.6);
  toTop.classList.toggle('visible', y > window.innerHeight);

    energy = Math.min(energy + 0.05, 2);
});

const carousel = document.querySelector('.carousel');
document.querySelector('.carousel-arrow.left').onclick = () => {
  carousel.scrollBy({ left: -carousel.clientWidth * 0.8, behavior: 'smooth' });
};
document.querySelector('.carousel-arrow.right').onclick = () => {
  carousel.scrollBy({ left: carousel.clientWidth * 0.8, behavior: 'smooth' });
};


const sectionObserver = new IntersectionObserver(
  entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
  { threshold: 0.2 }
);
sections.forEach(s => sectionObserver.observe(s));

const navObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link =>
        link.classList.toggle(
          'active',
          link.getAttribute('href').slice(1) === entry.target.id
        )
      );
    });
  },
  { threshold: 0.6 }
);
sections.forEach(s => navObserver.observe(s));

caret.onclick = () =>
  document.getElementById('mission').scrollIntoView({ behavior: 'smooth' });

toTop.onclick = () =>
  document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });

function animate() {
  energy *= 0.9;
    background.style.filter = `saturate(${135 + energy * 25}%)`;


  fields.forEach(f => {
    f.tx += Math.sin(Date.now() * 0.0001) * f.speed;
    f.ty += Math.cos(Date.now() * 0.00013) * f.speed;

    const dx = (mx / window.innerWidth - 0.5) * energy * 40;
    const dy = (my / window.innerHeight - 0.5) * energy * 40;

    f.x += (f.tx - f.x) * 0.02;
    f.y += (f.ty - f.y) * 0.02;

    f.el.style.setProperty('--gx', `${50 + f.x * 0.4 + dx}%`);
    f.el.style.setProperty('--gy', `${50 + f.y * 0.4 + dy}%`);
  });

  requestAnimationFrame(animate);
}

animate();
