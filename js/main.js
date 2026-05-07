gsap.registerPlugin(ScrollTrigger);

// --- UTILITY: Scroll Lock ---
function toggleScrollLock(shouldLock) {
    if (shouldLock) document.body.classList.add('scroll-locked');
    else document.body.classList.remove('scroll-locked');
}

// --- PRELOADER & CURTAIN LOGIC ---
const preloader = document.getElementById('preloader');
const pageCurtain = document.getElementById('page-curtain');

if (preloader) {
    // HOMEPAGE: Run logo preloader, then curtain up
    function hidePreloader() {
        if (!preloader || preloader.dataset.done) return;
        preloader.dataset.done = 'true';
        gsap.to(preloader, {
            yPercent: -100, duration: 0.8, ease: "power4.inOut",
            onComplete: () => {
                preloader.style.display = 'none';
                toggleScrollLock(false);
                initAnimations();
            }
        });
    }

    window.addEventListener('load', () => {
        const tl = gsap.timeline();
        tl.to('.loader-logo', { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
          .to('#loader-bar', { width: "100%", duration: 1.2, ease: "power2.inOut" })
          .to({}, { duration: 0.4 })
          .add(hidePreloader);

        setTimeout(() => {
            if (preloader && preloader.style.display !== 'none') {
                preloader.style.display = 'none';
                toggleScrollLock(false);
                initAnimations();
            }
        }, 5000);
    });
} else if (pageCurtain) {
    // INNER PAGES: Just curtain sweep up on load
    window.addEventListener('load', () => {
        // The curtain starts with class 'curtain-down' (visible). We animate it up and remove the class.
        gsap.to(pageCurtain, {
            yPercent: -100, duration: 0.8, ease: "power4.inOut", delay: 0.1,
            onComplete: () => {
                pageCurtain.classList.remove('curtain-down'); // Reset for potential SPA transition
                toggleScrollLock(false);
                initAnimations();
            }
        });
    });
} else {
    window.addEventListener('load', () => {
        toggleScrollLock(false);
        initAnimations();
    });
}

// --- SPA-LIKE LINK TRANSITIONS ---
document.querySelectorAll('a.transition-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto')) {
            e.preventDefault();
            toggleScrollLock(true);
            
            const curtainTarget = pageCurtain || document.getElementById('page-curtain');
            if (curtainTarget) {
                gsap.fromTo(curtainTarget, 
                    { yPercent: -100 }, // Start hidden
                    { yPercent: 0, duration: 0.6, ease: "power4.inOut", onComplete: () => window.location.href = href } // Sweep down, then navigate
                );
            } else {
                window.location.href = href;
            }
        }
    });
});

// --- INIT ALL ANIMATIONS ---
function initAnimations() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        gsap.from('.hero-content > *', { y: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: "power3.out", delay: 0.1 });
        gsap.from('.scroll-indicator', { opacity: 0, delay: 1, duration: 1 });
    }

    const heroBg = document.getElementById('hero-bg');
    if (heroBg) {
        gsap.to(heroBg, { yPercent: 20, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }

    const reveals = gsap.utils.toArray('.reveal');
    reveals.forEach(el => {
        gsap.to(el, {
            opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true }
        });
    });

    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const suffix = counter.getAttribute('data-suffix') || '';
        ScrollTrigger.create({
            trigger: counter, start: "top 88%", once: true,
            onEnter: () => {
                gsap.to({ val: 0 }, {
                    val: target, duration: 2, ease: "power2.out",
                    onUpdate: function () { counter.textContent = Math.round(this.targets()[0].val) + suffix; }
                });
            }
        });
    });

    // --- IMAGE UNVEIL ---
    const imgReveals = gsap.utils.toArray('.img-reveal-wrap');
    imgReveals.forEach(wrap => {
        ScrollTrigger.create({
            trigger: wrap,
            start: "top 85%",
            once: true,
            onEnter: () => wrap.classList.add('revealed')
        });
    });
}

// --- CUSTOM CURSOR ---
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0 });
        gsap.to(cursorOutline, { x: e.clientX, y: e.clientY, duration: 0.15 });
    });

    const hoverTargets = document.querySelectorAll('a, button, .card-wrap, .service-item, input, textarea, .select-trigger, .select-option, .faq-question');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

// --- SCROLL PROGRESS BAR ---
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    document.getElementById("progress-bar").style.width = scrolled + "%";
});

// --- NAVBAR SCROLL EFFECT ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

// --- 3D TILT EFFECT FOR CARDS ---
const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach(card => {
    card.addEventListener('mouseenter', () => card.style.transition = 'none');
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -5;
        const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 5;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s ease';
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
});

// --- MOBILE MENU ---
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

// Function to OPEN menu
function openMobileMenu() {
    if (!mobileMenu || mobileMenu.classList.contains('active')) return;
    toggleScrollLock(true);
    mobileMenu.classList.add('active');
    burger.classList.add('active');
    gsap.fromTo(mobileLinks, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, delay: 0.3, ease: "power2.out" }
    );
}

// Function to CLOSE menu
function closeMobileMenu() {
    if (!mobileMenu || !mobileMenu.classList.contains('active')) return;
    toggleScrollLock(false);
    mobileMenu.classList.remove('active');
    burger.classList.remove('active');
    gsap.to(mobileLinks, { 
        opacity: 0, y: 30, stagger: 0.05, duration: 0.3, ease: "power2.in", 
        onComplete: () => mobileLinks.forEach(l => { l.style.opacity = ''; l.style.transform = ''; }) 
    });
}

// Toggle menu on burger click
if (burger) {
    burger.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
}

// Close menu when a mobile link is clicked (so it doesn't stay open during page transition)
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeMobileMenu();
    });
});

// --- BACK TO TOP ---
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) backToTop.classList.add('visible');
        else backToTop.classList.remove('visible');
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// --- CUSTOM SELECT DROPDOWN ---
const customSelects = document.querySelectorAll('.custom-select');
customSelects.forEach(select => {
    const trigger = select.querySelector('.select-trigger');
    const options = select.querySelector('.select-options');
    const optionItems = select.querySelectorAll('.select-option');
    const hiddenInput = select.querySelector('input[type="hidden"]');
    const selectText = trigger.querySelector('.select-text');

    if (!trigger || !options) return;

    trigger.addEventListener('click', () => {
        const isActive = trigger.classList.contains('active');
        customSelects.forEach(s => { s.querySelector('.select-trigger').classList.remove('active'); s.querySelector('.select-options').classList.remove('active'); });
        if (!isActive) { trigger.classList.add('active'); options.classList.add('active'); }
    });

    optionItems.forEach(item => {
        item.addEventListener('click', () => {
            optionItems.forEach(opt => opt.classList.remove('selected'));
            item.classList.add('selected');
            if (selectText) selectText.textContent = item.textContent;
            if (hiddenInput) hiddenInput.value = item.dataset.value;
            select.classList.add('has-value');
            trigger.classList.remove('active');
            options.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!select.contains(e.target)) { trigger.classList.remove('active'); options.classList.remove('active'); }
    });
});

// --- CONTACT FORM ---
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const toast = document.getElementById('toast');
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = "Sending...";
        setTimeout(() => {
            btn.innerHTML = originalText;
            contactForm.reset();
            customSelects.forEach(select => {
                const selectText = select.querySelector('.select-text');
                const hiddenInput = select.querySelector('input[type="hidden"]');
                const optionItems = select.querySelectorAll('.select-option');
                if (selectText) selectText.textContent = 'Select Inquiry Type';
                if (hiddenInput) hiddenInput.value = '';
                optionItems.forEach(opt => opt.classList.remove('selected'));
                select.classList.remove('has-value');
            });
            if (toast) { toast.classList.add('active'); setTimeout(() => toast.classList.remove('active'), 3000); }
        }, 1500);
    });
}

// --- FAQ ACCORDION ---
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            faqItems.forEach(faq => faq.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    }
});

// --- NEWSLETTER FORM ---
const newsletterBtns = document.querySelectorAll('.newsletter-btn');
newsletterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        if (input && input.value.includes('@')) {
            btn.textContent = 'Added!'; btn.style.color = '#25D366'; input.value = '';
            setTimeout(() => { btn.textContent = 'Join'; btn.style.color = ''; }, 2500);
        }
    });
});

// --- MAGNETIC BUTTONS ---
const magneticElements = document.querySelectorAll('.btn, .nav-logo, .back-to-top, .whatsapp-btn');
magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        // Move element slightly towards cursor
        gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
    });
    el.addEventListener('mouseleave', () => {
        // Snap back to center
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
    });
});

// --- TEXT SCRAMBLE EFFECT ---
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) { complete++; output += to; } 
            else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += `<span style="color:var(--c-primary)">${char}</span>`;
            } else { output += from; }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) { this.resolve(); } 
        else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
    }
}

// Apply to nav links
document.querySelectorAll('.nav-link').forEach(link => {
    const scramble = new TextScramble(link);
    const originalText = link.innerText;
    link.addEventListener('mouseenter', () => scramble.setText(originalText));
});

// --- MASONRY FILTER ---
const filterBtns = document.querySelectorAll('.filter-btn');
const filterCards = document.querySelectorAll('.card-wrap[data-category]');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        
        filterCards.forEach(card => {
            if(filter === 'all' || card.getAttribute('data-category') === filter) {
                gsap.to(card, { opacity: 1, scale: 1, duration: 0.4, display: 'block' });
            } else {
                gsap.to(card, { opacity: 0, scale: 0.9, duration: 0.4, onComplete: () => card.style.display = 'none' });
            }
        });
    });
});

// =========================================
// SKELETON LOADER (Lazy Image Fade-in)
// =========================================
const lazyImages = document.querySelectorAll('img[loading="lazy"]');
lazyImages.forEach(img => {
    // If the image is already cached/loaded immediately
    if (img.complete) {
        img.classList.add('loaded');
    } else {
        // When it finishes loading, add the class to fade it in
        img.addEventListener('load', () => img.classList.add('loaded'));
    }
});


// =========================================
// PARALLAX DEPTH (Scroll-based movement)
// =========================================

// Stats Bar: Moves up slightly slower than the scroll
if (document.querySelector('.stats-bar')) {
    gsap.to('.stats-bar', {
        y: -40, ease: "none",
        scrollTrigger: { 
            trigger: '.stats-bar', 
            start: "top bottom", 
            end: "bottom top", 
            scrub: true 
        }
    });
}

// Testimonial Cards: Staggered depth (each card moves at a slightly different rate)
const testimonialCards = document.querySelectorAll('.testimonial-card');
if (testimonialCards.length > 0) {
    testimonialCards.forEach((card, i) => {
        gsap.to(card, {
            y: -30 - (i * 15), // 1st card moves -30px, 2nd -45px, 3rd -60px
            ease: "none",
            scrollTrigger: { 
                trigger: card, 
                start: "top bottom", 
                end: "bottom top", 
                scrub: true 
            }
        });
    });
}

// Services Floating Card: Creates a "floating" depth effect
if (document.querySelector('.services-floating-card')) {
    gsap.to('.services-floating-card', {
        y: -60, ease: "none",
        scrollTrigger: { 
            trigger: '.services-img-col', 
            start: "top bottom", 
            end: "bottom top", 
            scrub: true 
        }
    });
}