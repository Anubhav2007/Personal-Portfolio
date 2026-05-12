// ─── Cursor ───
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.transform = `translate(${mouseX - 6}px, ${mouseY - 6}px)`;
});

function animateRing() {
  ringX += (mouseX - ringX - 18) * 0.12;
  ringY += (mouseY - ringY - 18) * 0.12;
  ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
  requestAnimationFrame(animateRing);
}
animateRing();

// ─── Nav scroll ───
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ─── Mobile menu ───
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;
menuBtn.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('hidden-menu', !menuOpen);
});
document.querySelectorAll('.mobile-nav-link, #mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.add('hidden-menu');
  });
});

// ─── Scroll reveal ───
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── Count-up ───
function countUp(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1500;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current >= target) clearInterval(timer);
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(countUp);
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });
const heroSection = document.getElementById('hero');
if (heroSection) statsObserver.observe(heroSection);

// ─── Project card mouse tracking ───
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  });
});

// ─── Hero canvas (grid + particle) ───
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animId;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.life = 0;
    this.maxLife = Math.random() * 200 + 100;
  }
  update() {
    this.x += this.speedX; this.y += this.speedY; this.life++;
    if (this.life > this.maxLife) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232,255,71,${this.opacity * (1 - this.life / this.maxLife)})`;
    ctx.fill();
  }
}

for (let i = 0; i < 80; i++) particles.push(new Particle());

let time = 0;
function drawGrid() {
  const spacing = 60;
  ctx.strokeStyle = 'rgba(232,255,71,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
}

function drawWave() {
  ctx.strokeStyle = 'rgba(232,255,71,0.06)';
  ctx.lineWidth = 1;
  for (let wave = 0; wave < 3; wave++) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 4) {
      const y = canvas.height * 0.5 +
        Math.sin((x * 0.005 + time * 0.3 + wave * 0.8)) * 80 +
        Math.sin((x * 0.01 + time * 0.2)) * 40;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawWave();
  particles.forEach(p => { p.update(); p.draw(); });
  time += 0.01;
  animId = requestAnimationFrame(animate);
}
animate();

// ─── Contact form (Web3Forms) ───
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('.btn-submit');
    const btnText = document.getElementById('btn-text');
    const btnArrow = document.getElementById('btn-arrow');

    // Show loading state
    btn.disabled = true;
    btnText.textContent = 'Sending...';
    btnArrow.innerHTML = '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.4" stroke-dashoffset="10" style="animation:spin 1s linear infinite;transform-origin:center"/>';

    try {
      const formData = new FormData(contactForm);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();

      if (result.success) {
        // Success
        btnText.textContent = '✓ Sent!';
        btnArrow.innerHTML = '';
        btn.style.background = '#22c55e';
        contactForm.reset();
      } else {
        // API returned an error
        btnText.textContent = '✗ Failed';
        btnArrow.innerHTML = '';
        btn.style.background = '#ef4444';
      }
    } catch (err) {
      // Network error
      btnText.textContent = '✗ Error';
      btnArrow.innerHTML = '';
      btn.style.background = '#ef4444';
    }

    // Reset button after 3 seconds
    setTimeout(() => {
      btnText.textContent = 'Send Message';
      btn.style.background = '';
      btn.disabled = false;
      btnArrow.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>';
    }, 3000);
  });
}
