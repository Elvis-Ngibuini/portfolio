// Portfolio Configuration File
// Edit this file to easily update your portfolio content

const portfolioConfig = {
    // Personal Information
    personal: {
        name: "Eluis Ngibuini Thamaini",
        title: "Computer Science Graduate & Software Developer",
        description: "Transforming complex problems into elegant, efficient, and scalable solutions. Specializing in JavaScript, React, Node.js, and Cloud Technologies.",
        profileImage: "images/eluis.jpg",
        email: "elvisngibuini@gmail.com",
        phone: "+254 757 953 492",
        linkedin: "https://linkedin.com/in/eluis-ngibuni",
        github: "https://github.com/EluisNgibuni",
        location: "Nairobi, Kenya"
    },

    // Skills with proficiency levels (0-100)
    skills: {
        "Programming Languages": [
            { name: "JavaScript (ES6+)", level: 90, icon: "fab fa-js" },
            { name: "TypeScript", level: 85, icon: "fas fa-code" },
            { name: "Python", level: 80, icon: "fab fa-python" },
            { name: "Java", level: 75, icon: "fab fa-java" },
            { name: "PHP", level: 70, icon: "fab fa-php" }
        ],
        "Frontend": [
            { name: "React.js", level: 90, icon: "fab fa-react" },
            { name: "Next.js", level: 85, icon: "fas fa-code" },
            { name: "HTML5 & CSS3", level: 90, icon: "fab fa-html5" },
            { name: "Tailwind CSS", level: 85, icon: "fab fa-css3-alt" }
        ],
        "Backend": [
            { name: "Node.js", level: 85, icon: "fab fa-node-js" },
            { name: "Express.js", level: 80, icon: "fas fa-server" },
            { name: "RESTful APIs", level: 75, icon: "fas fa-code" }
        ],
        "Database & Cloud": [
            { name: "MongoDB", level: 85, icon: "fas fa-database" },
            { name: "PostgreSQL", level: 80, icon: "fas fa-database" },
            { name: "AWS", level: 75, icon: "fab fa-aws" }
        ]
    },

    // Projects
    projects: [
        {
            title: "Huduma Center Birth Certificate Collection Inventory System",
            description: "A comprehensive dashboard for managing birth certificate collections and tracking inventory at Huduma Center GPO.",
            image: "images/Huduma Center Homepage.png",
            category: "web",
            technologies: ["HTML", "JavaScript", "SQL", "CSS", "PHP"],
            githubUrl: "#",
            liveUrl: "#",
            featured: true,
            date: "Sept 2025",
            stats: ["20% Efficiency Gain", "100+ Daily Users"]
        },
        {
            title: "The Baobab Lounge - Menu Ordering System",
            description: "An interactive menu and ordering system for The Baobab Lounge, featuring real-time order management and a seamless user experience.",
            image: "images/Baobab homepage.png",
            category: "web",
            technologies: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
            githubUrl: "#",
            liveUrl: "#",
            featured: false,
            date: "Oct 2025",
            stats: ["50+ Menu Items", "Responsive Design"]
        },
        {
            title: "Chacadom Investments - Real Estate Platform",
            description: "A modern real estate platform for Chacadom Investments featuring property listings, virtual tours, and seamless inquiry system for potential buyers and renters.",
            image: "images/Chacadom homepage.png",
            category: "web",
            technologies: ["Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
            githubUrl: "#",
            liveUrl: "#",
            featured: false,
            date: "Nov 2025",
            stats: ["50+ Properties", "Advanced Search"]
        }
    ],

    // Work Experience
    experience: [
        {
            title: "Software Developer Intern",
            company: "Huduma Center GPO, Nairobi",
            period: "IT Attachment - May 2025 - August 2025",
            description: [
                "Developed and maintained internal web applications using React and Node.js, improving service delivery efficiency by 25%",
                "Collaborated with cross-functional teams to implement new features and optimize existing systems",
                "Created responsive UIs with modern JavaScript frameworks and CSS preprocessors",
                "Participated in code reviews and contributed to architectural decisions"
            ],
            technologies: ["React", "Node.js", "MongoDB", "REST APIs"]
        },
        {
            title: "Freelance Web Developer",
            company: "Self-Employed",
            period: "September 2025 - Present",
            description: [
                "Designed and developed responsive websites for small businesses and startups",
                "Implemented SEO best practices, improving client website traffic by an average of 40%",
                "Worked closely with clients to understand requirements and deliver customized solutions",
                "Optimized website performance, achieving 95+ Google PageSpeed scores"
            ],
            technologies: ["HTML5/CSS3", "JavaScript", "WordPress", "SEO"]
        }
    ],

    // Challenges/Certifications
    challenges: [
        {
            title: "DNS in Detail",
            category: "TryHackMe",
            description: "Understanding the Domain Name System (DNS) and its crucial role in internet connectivity.",
            image: "images/DNS.png",
            learnings: [
                "DNS hierarchy and record types (A, AAAA, CNAME, MX, TXT)",
                "DNS resolution process and name servers",
                "Using dig, nslookup, and whois for DNS queries",
                "DNS security considerations and common attacks"
            ],
            tools: ["dig", "nslookup", "whois"]
        },
        {
            title: "Introduction to Networking",
            category: "HackTheBox",
            description: "Gaining practical understanding of network fundamentals and device communication.",
            image: "images/Intro to Networking.png",
            learnings: [
                "Network protocols and the OSI model",
                "IP addressing and subnetting",
                "Network traffic analysis",
                "Basic network security concepts"
            ],
            tools: ["Wireshark", "Nmap", "tcpdump"]
        },
        {
            title: "Passive Reconnaissance",
            category: "TryHackMe",
            description: "Gathering intelligence about targets without direct interaction.",
            image: "images/Reconnaissance.png",
            learnings: [
                "WHOIS lookups and domain registration details",
                "DNS enumeration techniques",
                "Search engine dorking",
                "OSINT (Open-Source Intelligence) gathering"
            ],
            tools: ["whois", "theHarvester", "Google Dorks"]
        },
        {
            title: "Python Basics",
            category: "TryHackMe",
            description: "Building a strong foundation in Python programming for cybersecurity applications.",
            image: "images/python.png",
            learnings: [
                "Python syntax and data structures",
                "File I/O operations",
                "Error handling and exceptions",
                "Building a Bitcoin investment tracker"
            ],
            tools: ["Python 3", "Requests", "JSON"]
        },
        {
            title: "Web Application Security",
            category: "TryHackMe",
            description: "Understanding and mitigating common web application vulnerabilities.",
            image: "images/offensive.png",
            learnings: [
                "OWASP Top 10 vulnerabilities",
                "Secure coding practices",
                "Authentication and session management",
                "Input validation and output encoding"
            ],
            tools: ["Burp Suite", "OWASP ZAP", "Browser DevTools"]
        },
        {
            title: "Linux & Windows Fundamentals",
            category: "HackTheBox",
            description: "Mastering essential command-line operations and system administration.",
            image: "images/linux.png",
            learnings: [
                "Linux/Windows command line interface",
                "File system navigation and permissions",
                "Process and service management",
                "Basic shell scripting"
            ],
            tools: ["Bash", "PowerShell", "SSH"]
        }
    ]
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = portfolioConfig;
}