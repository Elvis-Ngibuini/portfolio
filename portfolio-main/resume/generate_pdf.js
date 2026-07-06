// This script can be used to generate a PDF from the resume
// You can run this using Node.js with the required packages installed
const fs = require('fs');
const { create } = require('html-pdf');
const markdownIt = require('markdown-it');
const md = new markdownIt();

// Read the markdown file
const markdown = fs.readFileSync('Eluis_Ngibuini_Resume.md', 'utf8');

// Convert markdown to HTML
const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Eluis Ngibuini - Resume</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
        h2 { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .contact-info { margin: 10px 0; font-size: 0.9em; }
        .section { margin-bottom: 20px; }
        .job-title { font-weight: bold; }
        .company { font-style: italic; }
        .date { float: right; color: #7f8c8d; }
        ul { margin: 5px 0; padding-left: 20px; }
        li { margin-bottom: 5px; }
        .skills { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill-tag { background: #f0f0f0; padding: 3px 8px; border-radius: 3px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Eluis Ngibuini Thamaini</h1>
        <div class="contact-info">
            <span>📧 eluisngibuinithamaini@gmail.com</span> | 
            <span>📞 +254 757 953 492</span> | 
            <span>🌐 eluisngibuni.github.io</span>
        </div>
    </div>
    ${md.render(markdown.split('##').slice(1).join('##'))}
</body>
</html>
`;

// Create PDF
create(html).toFile('./Eluis_Ngibuini_Resume.pdf', (err, res) => {
    if (err) return console.log(err);
    console.log('Resume PDF generated successfully!');
});
