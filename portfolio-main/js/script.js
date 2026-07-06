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
const resumeBtn = document.getElementById('resume-btn');

// Typing Effect Configuration
const words = ['Full-Stack Developer', 'Problem Solver', 'Tech Enthusiast'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isEnd = false;

// Typing Effect
function type() {
    if (!typedTextSpan) return;
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
        typedTextSpan.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typedTextSpan.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
}

// Theme Toggle
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Mobile Menu Toggle
function toggleMenu() {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
}

// Back to Top Button
function toggleBackToTop() {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Smooth Scroll for Navigation Links
function handleNavClick(e) {
    if (e.target.classList.contains('nav-link')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - navHeight;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    }
}

// Active Navigation Link
function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - navHeight - 100) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// Navbar Scroll Effect
function handleNavScroll() {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}

// Animate on scroll
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                entry.target.style.setProperty('--stagger-index', index % 10);
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0 0 -50px 0' });
    
    elements.forEach(el => observer.observe(el));
}

// Initialize everything
function init() {
    initTheme();
    type();
    updateYear();
    fetchAndRenderData();
    initScrollAnimations();
}

// Update Copyright Year
function updateYear() {
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}

// Fetch and render all data
const API_BASE = 'http://localhost:3001';

async function fetchAndRenderData() {
    try {
        // Fetch all data in parallel via bulk endpoint
        const bulkRes = await fetch(`${API_BASE}/api/bulk`);
        const bulkData = await bulkRes.json();
        
        if (bulkData.success) {
            const { home, projects, designs, skills, challenges, contributions, experience, contact } = bulkData.data;
            if (home) renderHome(home);
            if (projects) {
                window.allProjects = projects;
                renderProjects(projects);
            }
            if (designs) renderGraphicDesigns(designs);
            if (skills) renderSkills(skills);
            if (challenges) renderChallenges(challenges);
            if (contributions) renderContributions(contributions);
            if (experience) renderExperience(experience);
            if (contact) renderContact(contact);
            return;
        }
        
        // Fallback to individual endpoints if bulk fails
        const homeRes = await fetch(`${API_BASE}/api/home`);
        const homeData = await homeRes.json();
        if (homeData.success) renderHome(homeData.data);

        const projectsRes = await fetch(`${API_BASE}/api/projects`);
        const projectsData = await projectsRes.json();
        if (projectsData.success) {
            window.allProjects = projectsData.projects;
            renderProjects(projectsData.projects);
        }

        const designsRes = await fetch(`${API_BASE}/api/graphic-design`);
        const designsData = await designsRes.json();
        if (designsData.success) renderGraphicDesigns(designsData.designs);

        const skillsRes = await fetch(`${API_BASE}/api/skills`);
        const skillsData = await skillsRes.json();
        if (skillsData.success) renderSkills(skillsData.skills);

        const challengesRes = await fetch(`${API_BASE}/api/challenges`);
        const challengesData = await challengesRes.json();
        if (challengesData.success) renderChallenges(challengesData.challenges);

        const contributionsRes = await fetch(`${API_BASE}/api/contributions`);
        const contributionsData = await contributionsRes.json();
        if (contributionsData.success) renderContributions(contributionsData.contributions);

        const experienceRes = await fetch(`${API_BASE}/api/experience`);
        const experienceData = await experienceRes.json();
        if (experienceData.success) renderExperience(experienceData.experience);

        const contactRes = await fetch(`${API_BASE}/api/contact-info`);
        const contactData = await contactRes.json();
        if (contactData.success) renderContact(contactData.data);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Render home section
function renderHome(home) {
    const nameEl = document.querySelector('.hero-content h1');
    const titleEl = document.querySelector('.hero-content h2');
    const descEl = document.querySelector('.hero-content p');
    const imgEl = document.querySelector('.hero-image img');

    if (nameEl && home.name) nameEl.textContent = home.name;
    if (titleEl && home.title) titleEl.textContent = home.title;
    if (descEl && home.description) descEl.textContent = home.description;
    if (imgEl && home.image) imgEl.src = home.image;
}

// Render projects
function renderProjects(projects) {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    if (!projects.length) {
        projectsGrid.innerHTML = '<div class="loading">No projects yet...</div>';
        return;
    }

    projectsGrid.innerHTML = projects.map(project => `
        <div class="project-card animate-on-scroll" data-category="${project.category}">
            <div class="project-image">
                <img src="${project.images?.[0] || 'https://via.placeholder.com/400x250'}" alt="${project.title}" loading="lazy">
                <div class="project-overlay">
                    ${project.featured ? '<span class="project-badge">Featured</span>' : ''}
                    <div class="project-links">
                        ${project.github ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fab fa-github"></i></a>` : ''}
                        ${project.demo ? `<a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fas fa-external-link-alt"></i></a>` : ''}
                    </div>
                </div>
            </div>
            <div class="project-content">
                <div class="project-header">
                    <h3>${project.title}</h3>
                </div>
                <p>${project.description}</p>
                <div class="tech-stack">
                    ${(project.technologies || []).map(tech => `<span>${tech}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Render graphic designs
function renderGraphicDesigns(designs) {
    const designsSection = document.querySelector('#graphic-design');
    if (!designsSection) return;

    let container = designsSection.querySelector('.graphic-design-grid');
    if (!container) {
        container = document.createElement('div');
        container.className = 'graphic-design-grid';
        designsSection.appendChild(container);
    }

    if (!designs.length) {
        container.innerHTML = '<div class="loading">No designs yet...</div>';
        return;
    }

    container.innerHTML = designs.map(design => `
        <div class="graphic-design-card animate-on-scroll">
            <div class="design-image">
                <img src="${design.images?.[0] || 'https://via.placeholder.com/400x300'}" alt="${design.title}" loading="lazy">
                ${design.featured ? '<span class="design-badge">Featured</span>' : ''}
            </div>
            <div class="design-content">
                <h3>${design.title}</h3>
                <p>${design.description}</p>
                <div class="design-tools">
                    ${(design.tools || []).map(tool => `<span class="tool-tag">${tool}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Render skills
function renderSkills(skills) {
    const skillsContainer = document.querySelector('.skills-container');
    if (!skillsContainer) return;

    const categories = {};
    skills.forEach(skill => {
        if (!categories[skill.category]) categories[skill.category] = [];
        categories[skill.category].push(skill);
    });

    skillsContainer.innerHTML = Object.entries(categories).map(([category, categorySkills]) => `
        <div class="skill-category">
            <div class="skill-category-header">
                <i class="fas fa-code"></i>
                <h3>${category}</h3>
            </div>
            <div class="skill-tags">
                ${categorySkills.map(skill => `
                    <span class="skill-tag">
                        <i class="fas fa-code"></i>
                        ${skill.name}
                        <div class="skill-progress">
                            <div class="skill-level" style="width: ${skill.level}%"></div>
                        </div>
                    </span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Render challenges
function renderChallenges(challenges) {
    const challengesSection = document.querySelector('#challenges');
    if (!challengesSection) return;

    let container = challengesSection.querySelector('.challenges-grid');
    if (!container) {
        container = document.createElement('div');
        container.className = 'challenges-grid';
        challengesSection.appendChild(container);
    }

    if (!challenges.length) {
        container.innerHTML = '<div class="loading">No challenges yet...</div>';
        return;
    }

    container.innerHTML = challenges.map(challenge => `
        <div class="challenge-card animate-on-scroll">
            ${challenge.image ? `<img src="${challenge.image}" alt="${challenge.title}" loading="lazy">` : ''}
            <h3>${challenge.title}</h3>
            <p>${challenge.description}</p>
            ${challenge.url ? `<a href="${challenge.url}" target="_blank" rel="noopener noreferrer">View <i class="fas fa-external-link-alt"></i></a>` : ''}
        </div>
    `).join('');
}

// Render contributions
function renderContributions(contributions) {
    const contributionsSection = document.querySelector('#contributions');
    if (!contributionsSection) return;

    let container = contributionsSection.querySelector('.contributions-grid');
    if (!container) {
        container = document.createElement('div');
        container.className = 'contributions-grid';
        contributionsSection.appendChild(container);
    }

    if (!contributions.length) {
        container.innerHTML = '<div class="loading">No contributions yet...</div>';
        return;
    }

    container.innerHTML = contributions.map(contribution => `
        <div class="contribution-card animate-on-scroll">
            <h3>${contribution.title}</h3>
            <p>${contribution.description}</p>
            ${contribution.repo ? `<a href="${contribution.repo}" target="_blank" rel="noopener noreferrer">View Repo <i class="fab fa-github"></i></a>` : ''}
        </div>
    `).join('');
}

// Render experience
function renderExperience(experience) {
    const expContainer = document.querySelector('.experience-timeline');
    if (!expContainer) return;

    if (!experience.length) {
        expContainer.innerHTML = '<div class="loading">No experience yet...</div>';
        return;
    }

    expContainer.innerHTML = experience.map(exp => `
        <div class="experience-item animate-on-scroll">
            <div class="experience-date">
                <span>${exp.start} - ${exp.end || 'Present'}</span>
            </div>
            <div class="experience-content">
                <h3>${exp.role}</h3>
                <h4>${exp.company}</h4>
                <p>${exp.description}</p>
                <div class="tech-stack">
                    ${(exp.technologies || []).map(tech => `<span>${tech}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Render contact info
function renderContact(contact) {
    const contactContainer = document.querySelector('.contact-info');
    if (!contactContainer) return;

    const contactItems = [
        { icon: 'fa-envelope', label: 'Email', href: `mailto:${contact.email}`, value: contact.email },
        { icon: 'fa-phone', label: 'Phone', href: `tel:${contact.phone}`, value: contact.phone },
        { icon: 'fa-linkedin', label: 'LinkedIn', href: contact.linkedin, value: contact.linkedin },
        { icon: 'fa-github', label: 'GitHub', href: contact.github, value: contact.github },
        { icon: 'fa-whatsapp', label: 'WhatsApp', href: `https://wa.me/${contact.whatsapp?.replace(/\D/g, '')}`, value: contact.whatsapp }
    ].filter(item => item.value);

    contactContainer.innerHTML = contactItems.map(item => `
        <div class="contact-item">
            <div class="contact-icon">
                <i class="fab ${item.icon}"></i>
            </div>
            <div class="contact-details">
                <h3>${item.label}</h3>
                <p><a href="${item.href}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">${item.value}</a></p>
            </div>
        </div>
    `).join('');
}

// Event Listeners
themeToggle?.addEventListener('click', toggleTheme);
menuToggle?.addEventListener('click', toggleMenu);
backToTopBtn?.addEventListener('click', scrollToTop);
navLinks?.addEventListener('click', handleNavClick);

// Project filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        filterProjects(filter);
    });
});

window.addEventListener('scroll', () => {
    toggleBackToTop();
    updateActiveNav();
    handleNavScroll();
});

// Project filtering
function filterProjects(filter) {
    if (!window.allProjects) return;
    let filtered = window.allProjects;
    if (filter === 'featured') {
        filtered = window.allProjects.filter(p => p.featured);
    } else if (filter !== 'all') {
        filtered = window.allProjects.filter(p => p.category === filter);
    }
    renderProjects(filtered);
}

// Initialize on DOM Content Loaded
document.addEventListener('DOMContentLoaded', init);
