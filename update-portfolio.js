// Portfolio Update Script
// This script helps you update your portfolio content programmatically

class PortfolioUpdater {
    constructor(config) {
        this.config = config;
    }

    // Generate HTML for a project card
    generateProjectHTML(project) {
        const techTags = project.technologies.map(tech => `<span><i class="fab fa-${tech.toLowerCase()}"></i> ${tech}</span>`).join('\n                            ');
        const stats = project.stats ? project.stats.map(stat => `<span><i class="fas fa-chart-line"></i> ${stat}</span>`).join('\n                                ') : '';
        const featuredBadge = project.featured ? '<span class="project-badge">Featured</span>' : '';

        return `
                <!-- ${project.title} -->
                <div class="project-card" data-category="${project.category}">
                    <div class="project-image">
                        <img src="${project.image}" alt="${project.title}" loading="lazy">
                        <div class="project-overlay">
                            ${featuredBadge}
                            ${stats ? `<div class="project-stats">\n                                ${stats}\n                            </div>` : ''}
                        </div>
                    </div>
                    <div class="project-content">
                        <div class="project-header">
                            <h3>${project.title}</h3>
                            <div class="project-actions">
                                <a href="${project.githubUrl}" class="icon-link" aria-label="View on GitHub">
                                    <i class="fab fa-github"></i>
                                </a>
                                <a href="${project.liveUrl}" class="icon-link" aria-label="Live Demo">
                                    <i class="fas fa-external-link-alt"></i>
                                </a>
                            </div>
                        </div>
                        <p>${project.description}</p>
                        <div class="tech-stack">
                            ${techTags}
                        </div>
                        <div class="project-footer">
                            <button class="btn btn-outline btn-sm" data-project="${project.title.toLowerCase().replace(/\s+/g, '-')}">
                                <i class="fas fa-info-circle"></i> View Details
                            </button>
                            <span class="project-date">${project.date}</span>
                        </div>
                    </div>
                </div>`;
    }

    // Generate HTML for experience timeline
    generateExperienceHTML(exp) {
        const descriptions = exp.description.map(desc => `<li>${desc}</li>`).join('\n                            ');
        const techTags = exp.technologies.map(tech => `<span>${tech}</span>`).join('\n                            ');

        return `
                <!-- ${exp.title} -->
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <h3>${exp.title}</h3>
                            <span class="timeline-period">${exp.period}</span>
                        </div>
                        <h4>${exp.company}</h4>
                        <ul class="timeline-details">
                            ${descriptions}
                        </ul>
                        <div class="tech-tags">
                            ${techTags}
                        </div>
                    </div>
                </div>`;
    }

    // Generate HTML for skills
    generateSkillHTML(skillCategory, skills) {
        const skillItems = skills.map(skill => `
                        <div class="skill-item" data-level="${skill.level}">
                            <span class="skill-name">${skill.name}</span>
                            <div class="skill-bar">
                                <div class="skill-level"></div>
                            </div>
                        </div>`).join('\n');

        return `
                <!-- ${skillCategory} -->
                <div class="skill-category">
                    <div class="skill-category-header">
                        <i class="${skills[0].icon}"></i>
                        <h3>${skillCategory}</h3>
                    </div>
                    <div class="skill-items">
                        ${skillItems}
                    </div>
                </div>`;
    }

    // Generate HTML for challenges
    generateChallengeHTML(challenge) {
        const learnings = challenge.learnings.map(learning => `<li>${learning}</li>`).join('\n                            ');
        const tools = challenge.tools.map(tool => `<span class="tool-tag">${tool}</span>`).join('\n                            ');

        return `
                <!-- ${challenge.title} -->
                <div class="challenge-card">
                    <div class="challenge-header">
                        <div class="challenge-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <div class="challenge-title">
                            <h3>${challenge.title}</h3>
                            <span class="challenge-category">${challenge.category}</span>
                        </div>
                    </div>
                    <div class="challenge-content">
                        <h4>Problem Statement</h4>
                        <p>${challenge.description}</p>

                        <h4>Key Learnings</h4>
                        <ul class="challenge-details">
                            ${learnings}
                        </ul>

                        <div class="challenge-image">
                            <img src="${challenge.image}" alt="${challenge.title} Completion" loading="lazy">
                        </div>

                        <div class="challenge-tools">
                            <span><i class="fas fa-tools"></i> Tools:</span>
                            ${tools}
                        </div>
                    </div>
                </div>`;
    }

    // Generate complete sections
    generateAllProjects() {
        return this.config.projects.map(project => this.generateProjectHTML(project)).join('\n');
    }

    generateAllExperience() {
        return this.config.experience.map(exp => this.generateExperienceHTML(exp)).join('\n');
    }

    generateAllSkills() {
        return Object.entries(this.config.skills)
            .map(([category, skills]) => this.generateSkillHTML(category, skills))
            .join('\n');
    }

    generateAllChallenges() {
        return this.config.challenges.map(challenge => this.generateChallengeHTML(challenge)).join('\n');
    }

    // Generate update instructions
    generateUpdateInstructions() {
        return `
# Portfolio Update Instructions

## How to Add New Content:

### 1. Adding a New Project:
1. Add your project image to the \`images/\` folder
2. Open \`portfolio-config.js\`
3. Add a new project object to the \`projects\` array:

\`\`\`javascript
{
    title: "Your New Project",
    description: "Project description here...",
    image: "images/your-project-image.png",
    category: "web", // or "dsa", "cloud"
    technologies: ["React", "Node.js", "MongoDB"],
    githubUrl: "https://github.com/yourusername/project",
    liveUrl: "https://your-project-demo.com",
    featured: false,
    date: "Jan 2026",
    stats: ["Custom Stat 1", "Custom Stat 2"]
}
\`\`\`

### 2. Adding Work Experience:
Add to the \`experience\` array in \`portfolio-config.js\`:

\`\`\`javascript
{
    title: "Your Job Title",
    company: "Company Name, Location",
    period: "Start Date - End Date",
    description: [
        "Achievement or responsibility 1",
        "Achievement or responsibility 2",
        "Achievement or responsibility 3"
    ],
    technologies: ["Tech1", "Tech2", "Tech3"]
}
\`\`\`

### 3. Adding Skills:
Update the \`skills\` object in \`portfolio-config.js\`:

\`\`\`javascript
"Your Skill Category": [
    { name: "Skill Name", level: 85, icon: "fab fa-icon-name" }
]
\`\`\`

### 4. Adding Challenges/Certifications:
Add to the \`challenges\` array:

\`\`\`javascript
{
    title: "Challenge/Certification Name",
    category: "Platform Name",
    description: "What this challenge/certification covers",
    image: "images/certificate-image.png",
    learnings: [
        "Key learning 1",
        "Key learning 2"
    ],
    tools: ["Tool1", "Tool2"]
}
\`\`\`

### 5. Updating Personal Information:
Edit the \`personal\` object in \`portfolio-config.js\`:

\`\`\`javascript
personal: {
    name: "Your Full Name",
    title: "Your Professional Title",
    description: "Your professional summary...",
    profileImage: "images/your-photo.jpg",
    email: "your.email@example.com",
    phone: "+1234567890",
    linkedin: "https://linkedin.com/in/yourprofile",
    github: "https://github.com/yourusername"
}
\`\`\`

## After Making Changes:
1. Save the \`portfolio-config.js\` file
2. Run the update script (if implemented)
3. Or manually copy the generated HTML to \`index.html\`
4. Test your changes by opening \`index.html\` in a browser
5. Deploy your updated portfolio

## Tips:
- Always backup your files before making changes
- Use descriptive image names
- Optimize images for web (compress them)
- Test on different screen sizes
- Keep descriptions concise but informative
        `;
    }
}

// Usage example:
if (typeof portfolioConfig !== 'undefined') {
    const updater = new PortfolioUpdater(portfolioConfig);

    // You can use these methods to generate HTML:
    // console.log(updater.generateAllProjects());
    // console.log(updater.generateAllExperience());
    // console.log(updater.generateAllSkills());
    // console.log(updater.generateAllChallenges());
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioUpdater;
}