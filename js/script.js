// DOM Elements
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const backToTopBtn = document.querySelector('.back-to-top');
const nav = document.querySelector('nav');
const sections = document.querySelectorAll('section');
const navHeight = nav.offsetHeight;
const typedTextSpan = document.querySelector('.typed-text');
const cursorSpan = document.querySelector('.cursor');
const contactForm = document.getElementById('contact-form');
const resumeBtn = document.getElementById('resume-btn');

// Typing Effect Configuration
const words = [
    'Full-Stack Developer',
    'Problem Solver',
    'Tech Enthusiast',
    'Open Source Contributor',
    'Lifelong Learner',
    'Team Player'
];

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isEnd = false;

function type() {
    const currentWord = words[wordIndex];
    const currentChar = currentWord.substring(0, charIndex);
    
    typedTextSpan.textContent = currentChar;
    
    if (!isDeleting && charIndex < currentWord.length) {
        // Typing
        charIndex++;
        setTimeout(type, 100);
    } else if (isDeleting && charIndex > 0) {
        // Deleting
        charIndex--;
        setTimeout(type, 50);
    } else {
        // Change word
        isDeleting = !isDeleting;
        
        if (!isDeleting) {
            wordIndex = (wordIndex + 1) % words.length;
        }
        
        setTimeout(type, isDeleting ? 1000 : 1000);
    }
}

// Theme Toggle
function setTheme(theme) {
    const root = document.documentElement;
    const icon = themeToggle.querySelector('i');
    
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Mobile Menu Toggle
function toggleMenu() {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
}

// Active Navigation Link
function setActiveNavLink() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            current = `#${section.getAttribute('id')}`;
        }
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === current) {
            link.classList.add('active');
        }
    });
}

// Back to Top Button
function toggleBackToTop() {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
}

// Animate Skills on Scroll
function animateSkills() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    skillBars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        if (isElementInViewport(bar) && !bar.style.width) {
            bar.style.width = width;
        }
    });
}

// Check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Animate elements on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.classList.add('animated');
        }
    });
}

// Initialize tooltips if Bootstrap is available
if (typeof bootstrap !== 'undefined') {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}
// Toggle mobile menu
function toggleMenu() {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
}

// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Start typing effect
    if (typedTextSpan && cursorSpan) {
        setTimeout(type, 1000);
    }
    
    // Set theme based on preference or system setting
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    
    // Initialize particles if available
    if (typeof particlesJS !== 'undefined') {
        initParticles();
    }
    
    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
    
    // Set current year in footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Add scroll event listeners
    window.addEventListener('scroll', () => {
        setActiveNavLink();
        toggleBackToTop();
        animateSkills();
        animateOnScroll();
    });
    
    // Initial checks
    animateSkills();
    animateOnScroll();
    
    // Event Listeners
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }
    
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Close mobile menu when clicking on a nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });
    
    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Add form submission logic here
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        });
    }
    
    // Resume button now directly links to resume.html
    animateOnScroll();
    
    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', toggleMenu);
    
    // Close mobile menu when clicking on a nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
    
    // Back to top button
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Initialize project filtering
    const projectCards = document.querySelectorAll('.project-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.transform = 'translateY(0)';
            });
            
            // Add active class to clicked button with animation
            button.classList.add('active');
            button.style.transform = 'translateY(-2px)';
            
            const filter = button.getAttribute('data-filter');
            let visibleCount = 0;
            
            // Animate out all project cards
            projectCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            });
            
            // After a short delay, show filtered cards with staggered animation
            setTimeout(() => {
                projectCards.forEach((card) => {
                    const category = card.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        visibleCount++;
                        card.style.display = 'block';
                        // Stagger the animation for a nice effect
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50 * visibleCount);
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // If no projects match the filter, show a message
                const noResults = document.querySelector('.no-results');
                if (visibleCount === 0) {
                    if (!noResults) {
                        const noResultsEl = document.createElement('div');
                        noResultsEl.className = 'no-results';
                        noResultsEl.innerHTML = `
                            <div class="no-results-content">
                                <i class="fas fa-search"></i>
                                <h3>No projects found</h3>
                                <p>Try selecting a different filter or check back later for updates!</p>
                            </div>
                        `;
                        const projectsGrid = document.querySelector('.projects-grid');
                        if (projectsGrid) {
                            projectsGrid.appendChild(noResultsEl);
                            
                            // Fade in the no results message
                            setTimeout(() => {
                                noResultsEl.style.opacity = '1';
                                noResultsEl.style.transform = 'translateY(0)';
                            }, 50);
                        }
                    }
                } else if (noResults) {
                    noResults.style.opacity = '0';
                    noResults.style.transform = 'translateY(20px)';
                    setTimeout(() => noResults.remove(), 300);
                }
            }, 300);
        });
    });
    
    // Initialize tech stack hover effects
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            const skill = item.getAttribute('data-skill');
            const allItems = document.querySelectorAll(`.tech-item[data-skill="${skill}"]`);
            allItems.forEach(i => i.classList.add('highlight'));
        });
        
        item.addEventListener('mouseleave', (e) => {
            const skill = item.getAttribute('data-skill');
            const allItems = document.querySelectorAll(`.tech-item[data-skill="${skill}"]`);
            allItems.forEach(i => i.classList.remove('highlight'));
        });
    });
    
    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const formObject = {};
            
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Here you would typically send the form data to a server
            console.log('Form submitted:', formObject);
            
            // Show success message
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        });
    }
    
    // Resume button now directly links to resume.html
});

// Initialize particles.js if available
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { 
                    value: 80, 
                    density: { 
                        enable: true, 
                        value_area: 800 
                    } 
                },
                color: { 
                    value: '#00d4ff' 
                },
                shape: { 
                    type: 'circle' 
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: { 
                        enable: true, 
                        speed: 1, 
                        opacity_min: 0.1, 
                        sync: false 
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: { 
                        enable: true, 
                        speed: 2, 
                        size_min: 0.1, 
                        sync: false 
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00d4ff',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: { 
                        enable: false, 
                        rotateX: 600, 
                        rotateY: 1200 
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { 
                        enable: true, 
                        mode: 'grab' 
                    },
                    onclick: { 
                        enable: true, 
                        mode: 'push' 
                    },
                    resize: true
                },
                modes: {
                    grab: { 
                        distance: 140, 
                        line_linked: { 
                            opacity: 0.5 
                        } 
                    },
                    push: { 
                        particles_nb: 4 
                    }
                }
            },
            retina_detect: true
        });
    }
}
