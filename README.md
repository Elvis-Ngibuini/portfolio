# <ENT/> - Eluis Ngibuini Thamaini

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fexample.com)](https://example.com)
[![GitHub stars](https://img.shields.io/github/stars/EluisNgibuni/portfolio?style=social)](https://github.com/EluisNgibuni/portfolio)

A modern, tech-themed portfolio website showcasing my skills, projects, and experience as a Computer Science graduate. Built with pure HTML, CSS, and JavaScript for optimal performance and user experience.

## ✨ Features

- **Modern Tech Theme** - Sleek, professional design with a technology focus
- **Dark/Light Mode** - Automatic theme detection with manual toggle
- **Interactive Elements** - Smooth animations using AOS (Animate On Scroll)
- **Dynamic Typing Effect** - Engaging hero section with typewriter animation
- **Project Showcase** - Filterable project gallery with hover effects
- **Tech Stack Section** - Detailed display of technical skills by category
- **Responsive Design** - Fully responsive layout for all devices
- **Performance Optimized** - Fast loading with optimized assets and code
- **Particle.js Background** - Interactive particle effect in the hero section

## 🛠️ Technologies Used

- **Frontend**
  - HTML5, CSS3, JavaScript (ES6+)
  - CSS Grid & Flexbox for responsive layouts
  - CSS Variables for dynamic theming
  - Vanilla JavaScript (No UI frameworks)
  - AOS (Animate On Scroll) library
  - Particle.js for interactive backgrounds

- **Icons & Fonts**
  - Font Awesome 6.0
  - Google Fonts (Inter & Fira Code)
  - Boxicons for additional icons

- **Tools**
  - VS Code
  - Git & GitHub
  - Prettier (Code formatting)
  - Live Server (Development)

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Code editor (VS Code recommended)
- Git (for version control)
- Node.js & npm (optional, for development)
- Basic understanding of HTML, CSS, and JavaScript

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EluisNgibuni/portfolio.git
   cd portfolio
   ```

2. **Set up the project**
   - Install dependencies (optional):
     ```bash
     npm install
     ```
   - Or use the included CDN links (no installation required)

3. **Customize your portfolio**
   - Update personal information in `index.html`
   - Add your projects to the projects section
   - Modify colors and fonts in `css/styles.css`
   - Customize animations in `js/script.js`
   - Add your profile picture to `assets/` as `profile.jpg`
   - Add project images to `assets/projects/`

4. **Run locally**
   - Option 1: Open `index.html` directly in your browser
   - Option 2: Use Live Server in VS Code
   - Option 3: Use Python's built-in server:
     ```bash
     python -m http.server 8000
     ```
     Then open `http://localhost:8000` in your browser

## 📁 Project Structure

```
portfolio/
├── assets/                   # Static assets
│   ├── profile.jpg           # Profile picture
│   ├── projects/             # Project screenshots
│   │   ├── project1.jpg
│   │   └── project2.jpg
│   └── favicon/              # Favicon files
│       ├── favicon.ico
│       └── favicon-32x32.png
├── css/
│   └── styles.css            # Main stylesheet with CSS variables
├── js/
│   ├── script.js             # Main JavaScript file
│   ├── particles.min.js      # Particle.js library
│   └── aos.js                # AOS animation library
├── index.html                # Main HTML file
├── README.md                 # This file
└── LICENSE                   # MIT License
```

## 🎨 Customization

### Theme Colors

Edit the CSS variables in `css/styles.css` to customize the color scheme:

```css
:root {
    /* Light Theme */
    --primary-color: #00d4ff;
    --primary-dark: #00a3cc;
    --secondary-color: #0a0a0a;
    --text-color: #333333;
    --text-light: #666666;
    --bg-color: #ffffff;
    --card-bg: #f8f9fa;
    --border-color: #e9ecef;
    --success: #28a745;
    --warning: #ffc107;
    --danger: #dc3545;
    
    /* Dark Theme */
    --dark-primary: #00c3ff;
    --dark-secondary: #f8f9fa;
    --dark-text: #f8f9fa;
    --dark-bg: #121212;
    --dark-card: #1e1e1e;
    --dark-border: #333333;
    
    /* Gradients */
    --gradient-primary: linear-gradient(135deg, #00d4ff 0%, #0077ff 100%);
    --gradient-secondary: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    
    /* Shadows */
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
    
    /* Transitions */
    --transition: all 0.3s ease;
}
```

### Adding Projects

Add new project cards to the projects section in `index.html`:

```html
<div class="project-card" data-category="web">
    <div class="project-image">
        <img src="assets/projects/your-project.jpg" alt="Project Name" loading="lazy">
        <div class="project-overlay">
            <div class="project-stats">
                <span><i class="fas fa-star"></i> 42</span>
                <span><i class="fas fa-code-branch"></i> 8</span>
            </div>
        </div>
        <span class="project-badge">Featured</span>
    </div>
    <div class="project-content">
        <h3>Project Name</h3>
        <p>A brief description of the project and its key features. Keep it concise but informative.</p>
        <div class="tech-stack">
            <span>HTML5</span>
            <span>CSS3</span>
            <span>JavaScript</span>
        </div>
        <div class="project-actions">
            <a href="#" class="btn btn-primary" target="_blank">
                <i class="fas fa-external-link-alt"></i> Live Demo
            </a>
            <a href="#" class="btn btn-outline" target="_blank">
                <i class="fab fa-github"></i> Source Code
            </a>
        </div>
    </div>
    <div class="project-footer">
        <span><i class="far fa-calendar-alt"></i> Oct 2023</span>
        <a href="#" class="project-link">Read Case Study <i class="fas fa-arrow-right"></i></a>
    </div>
</div>
            <span>CSS</span>
            <span>JavaScript</span>
        </div>
        <div class="project-links">
            <a href="#" class="btn-link">View Details</a>
            <a href="#" class="btn-link" target="_blank">Live Demo</a>
        </div>
    </div>
</div>
```

### Updating Skills

Update the skills section in `index.html`:

```html
<div class="skill-item">
    <div class="skill-info">
        <span>JavaScript (ES6+)</span>
        <span>90%</span>
    </div>
    <div class="skill-bar">
        <div class="skill-progress" data-width="90%"></div>
    </div>
</div>
```

## 🚀 Deployment

### Quick Deployment (Recommended)

**Frontend (GitHub Pages):**
```bash
# Run the automated deployment script
deploy.bat

# Or manually:
git add .
git commit -m "Deploy to production"
git push origin main
```

Then enable GitHub Pages:
1. Go to: https://github.com/EluisNgibuni/portfolio/settings/pages
2. Source: Deploy from branch
3. Branch: main / root
4. Save

**Your site will be live at:** https://eluisngibuni.github.io/portfolio

**Backend (Contact Form & Admin):**

See detailed guide: [BACKEND-DEPLOYMENT.md](BACKEND-DEPLOYMENT.md)

Recommended: Deploy to [Render.com](https://render.com) (Free tier available)

### Pre-Deployment Testing

Run the test script to verify everything is ready:
```bash
test-deployment.bat
```

### Deployment Documentation

- **Quick Reference**: [DEPLOYMENT-QUICK-REFERENCE.md](DEPLOYMENT-QUICK-REFERENCE.md)
- **Full Checklist**: [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)
- **Backend Guide**: [BACKEND-DEPLOYMENT.md](BACKEND-DEPLOYMENT.md)
- **Security Info**: [SECURITY-IMPROVEMENTS.md](SECURITY-IMPROVEMENTS.md)

### After Deployment

1. Test contact form submission
2. Verify admin panel access
3. Check mobile responsiveness
4. Submit sitemap to Google Search Console
5. Set up analytics (optional)

---

## Deployment

### GitHub Pages

1. Create a new repository on GitHub
2. Push your code to the `main` branch
3. Go to Settings > Pages
4. Select the `main` branch and click Save
5. Your site will be live at `https://yourusername.github.io/your-repo-name/`

### Netlify

1. Drag and drop the project folder to Netlify
2. Or connect your GitHub repository
3. Netlify will automatically deploy your site

## Performance Optimization

- Optimize images before uploading
- Minimize CSS and JavaScript in production
- Enable GZIP compression on your server
- Use a CDN for assets

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 10+)
- Chrome for Android

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Font Awesome](https://fontawesome.com/) for beautiful icons
- [Google Fonts](https://fonts.google.com/) for the Inter and Fira Code fonts
- [AOS](https://michalsnik.github.io/aos/) for scroll animations
- [Particle.js](https://vincentgarreau.com/particles.js/) for the interactive background
- [Unsplash](https://unsplash.com/) for placeholder images
- [Boxicons](https://boxicons.com/) for additional icons

## Stargazers

[![Stargazers repo roster for @EluisNgibuni/portfolio](https://reporoster.com/stars/EluisNgibuni/portfolio)](https://github.com/EluisNgibuni/portfolio/stargazers)

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

- [LinkedIn](https://linkedin.com/in/yourprofile)
- [GitHub](https://github.com/EluisNgibuni)
- [Twitter](https://twitter.com/yourhandle)
- Email: your.email@example.com
