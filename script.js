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
let animationId = null;
let isAnimating = false;

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

/* ─── Carousel ─── */
const carousel = document.querySelector('.carousel');

function scrollCarousel(direction) {
  const slide = carousel.querySelector('.event-slide');
  if (!slide) return;
  const slideWidth = slide.offsetWidth + 32;
  carousel.scrollBy({ left: direction * slideWidth, behavior: 'smooth' });
}

document.querySelector('.carousel-arrow.left').onclick = () => scrollCarousel(-1);
document.querySelector('.carousel-arrow.right').onclick = () => scrollCarousel(1);

function updateCarouselArrows() {
  const left = document.querySelector('.carousel-arrow.left');
  const right = document.querySelector('.carousel-arrow.right');
  left.style.opacity = carousel.scrollLeft <= 5 ? '0.3' : '1';
  right.style.opacity =
    carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 5
      ? '0.3' : '1';
}

if (carousel) {
  carousel.addEventListener('scroll', updateCarouselArrows);
  window.addEventListener('resize', updateCarouselArrows);
  updateCarouselArrows();
}

/* ─── Animation on/off logic — re-evaluates on resize & orientation change ─── */
const mobileQuery = window.matchMedia('(max-width: 768px)');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function shouldAnimate() {
  return !mobileQuery.matches && !reducedMotionQuery.matches;
}

function startAnimation() {
  if (isAnimating) return;
  isAnimating = true;
  fields.forEach(f => { f.el.style.display = ''; });
  animationId = requestAnimationFrame(animateLoop);
}

function stopAnimation() {
  if (!isAnimating) return;
  isAnimating = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  fields.forEach(f => { f.el.style.display = 'none'; });
  background.style.filter = '';
}

function handleMediaChange() {
  if (shouldAnimate()) {
    startAnimation();
  } else {
    stopAnimation();
  }
}

mobileQuery.addEventListener('change', handleMediaChange);
reducedMotionQuery.addEventListener('change', handleMediaChange);

/* ─── Section observers ─── */
const sectionObserver = new IntersectionObserver(
  entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
  { threshold: 0.2 }
);
sections.forEach(s => sectionObserver.observe(s));

const navObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href').slice(1) === entry.target.id
        );
      });
    });
  },
  { threshold: 0, rootMargin: '-40% 0px -55% 0px' }
);
sections.forEach(s => navObserver.observe(s));

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

/* ─── Scroll helpers ─── */
caret.onclick = () =>
  document.getElementById('mission').scrollIntoView({ behavior: 'smooth' });

toTop.onclick = () =>
  document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });

/* ─── Single animation loop — only one definition, only one rAF chain ─── */
function animateLoop() {
  if (!isAnimating) return;

  energy *= 0.9;
  background.style.filter = `saturate(${135 + energy * 25}%)`;

  const t = Date.now();
  fields.forEach(f => {
    f.tx += Math.sin(t * 0.0001) * f.speed;
    f.ty += Math.cos(t * 0.00013) * f.speed;

    const dx = (mx / window.innerWidth - 0.5) * energy * 40;
    const dy = (my / window.innerHeight - 0.5) * energy * 40;

    f.x += (f.tx - f.x) * 0.02;
    f.y += (f.ty - f.y) * 0.02;

    f.el.style.setProperty('--gx', `${50 + f.x * 0.4 + dx}%`);
    f.el.style.setProperty('--gy', `${50 + f.y * 0.4 + dy}%`);
  });

  animationId = requestAnimationFrame(animateLoop);
}

/* ─── Team modal ─── */
const modal = document.getElementById('teamModal');
const closeBtn = document.querySelector('.team-modal-close');

function buildDegreeLine(card) {
  const parts = [];
  if (card.dataset.year) parts.push(card.dataset.year);
  if (card.dataset.major) parts.push(card.dataset.major);
  if (card.dataset.specialization)
    parts.push(`${card.dataset.specialization} specialization`);
  if (card.dataset.minor)
    parts.push(`Minor in ${card.dataset.minor}`);
  return parts.join(' · ');
}

const qWhy        = document.getElementById('q-why');
const qMemory     = document.getElementById('q-memory');
const qInvolvement= document.getElementById('q-involvement');
const qExtra      = document.getElementById('q-extra');

document.querySelectorAll('.team-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.add('flipping');
    setTimeout(() => {
      document.getElementById('modalImage').src  = card.dataset.img || '';
      document.getElementById('modalName').textContent =
        card.dataset.name || card.querySelector('.team-name')?.textContent || '';
      document.getElementById('modalRole').textContent =
        card.querySelector('.team-role')?.textContent || '';
      document.getElementById('modalDegree').textContent   = buildDegreeLine(card);
      document.getElementById('modalHometown').textContent =
        card.dataset.hometown ? `From ${card.dataset.hometown}` : '';

      qWhy.textContent        = card.dataset.why        || '';
      qMemory.textContent     = card.dataset.memory     || '';
      qInvolvement.textContent= card.dataset.involvement|| '';
      qExtra.textContent      = card.dataset.extra      || '';

      modal.classList.add('active');
      card.classList.remove('flipping');
    }, 300);
  });
});

closeBtn.onclick = () => modal.classList.remove('active');
modal.querySelector('.team-modal-backdrop').onclick = () =>
  modal.classList.remove('active');

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    modal.classList.remove('active');
  }
});

/* ─── Single entry point — no duplicate animate() call ─── */
handleMediaChange();