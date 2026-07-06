document.addEventListener('DOMContentLoaded', function() {
    const resumeBtn = document.getElementById('resume-btn');
    
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function(e) {
            // Track download event (you can replace this with your analytics)
            console.log('Resume download initiated');
            // You can add Google Analytics or other tracking here
            // Example: gtag('event', 'download', { 'event_category': 'Resume', 'event_label': 'Resume Download' });
            
            // Optional: Add a small delay to ensure the download starts before any potential page navigation
            setTimeout(() => {
                // The download will proceed automatically due to the download attribute
            }, 200);
        });
    }

    // Add animation class on scroll for the resume button
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-pulse');
            }
        });
    }, observerOptions);

    const resumeButton = document.querySelector('.btn-resume');
    if (resumeButton) {
        observer.observe(resumeButton);
    }
});
