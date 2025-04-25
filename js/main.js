document.addEventListener('DOMContentLoaded', () => {
    // Load theme preference
    loadThemePreference();
    
    // Theme toggle functionality
    setupThemeToggle();
    
    // Contact modal functionality
    setupContactModal();
    
    // Load saved content
    loadSavedContent();
    
    // Setup DORA metrics charts
    setupDoraCharts();
    
    // Set the RGB values for backgrounds
    updateRgbValues();
    
    // Setup navigation highlight
    highlightActiveNavItem();
    
    // Setup navbar scroll effect
    setupNavbarScroll();
    
    // Mobile menu toggle
    setupMobileMenu();
    
    // Initialize animations
    initializeAnimations();
});

// Theme Toggle
function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        
        // Save preference to localStorage
        const isDarkTheme = document.body.classList.contains('dark-theme');
        localStorage.setItem('portfolio_dark_theme', isDarkTheme);
        
        // Update RGB values for background
        updateRgbValues();
        
        // Update chart colors with small delay to ensure CSS vars are updated
        setTimeout(() => {
            updateChartColors();
        }, 50);
    });
}

// Update RGB values based on theme
function updateRgbValues() {
    const isDarkTheme = document.body.classList.contains('dark-theme');
    document.documentElement.style.setProperty('--card-bg-rgb', isDarkTheme ? '30, 30, 30' : '255, 255, 255');
}

// Load Theme Preference
function loadThemePreference() {
    const isDarkTheme = localStorage.getItem('portfolio_dark_theme') === 'true';
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
    }
}

// Contact Modal
function setupContactModal() {
    const contactBtns = document.querySelectorAll('#contact-btn, #hero-contact-btn');
    const contactModal = document.getElementById('contact-modal');
    const closeButton = contactModal.querySelector('.modal-close');
    
    contactBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            openModal(contactModal);
        });
    });
    
    closeButton.addEventListener('click', () => {
        closeModal(contactModal);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === contactModal) {
            closeModal(contactModal);
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && contactModal.style.display === 'block') {
            closeModal(contactModal);
        }
    });
}

// Open modal with animation
function openModal(modal) {
    modal.style.display = 'block';
    // Trigger reflow
    modal.offsetHeight;
    modal.classList.add('active');
}

// Close modal with animation
function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // Match transition duration
}

// Load saved content
function loadSavedContent() {
    // Load all editable elements
    document.querySelectorAll('.editable').forEach(element => {
        const fieldName = element.getAttribute('data-field');
        const savedContent = localStorage.getItem(`portfolio_${fieldName}`);
        
        if (savedContent) {
            element.textContent = savedContent;
        }
    });
    
    // Load profile photo if it exists
    const savedPhoto = localStorage.getItem('portfolio_profile_photo');
    if (savedPhoto) {
        document.getElementById('profile-photo').src = savedPhoto;
    }
}

// Setup mobile menu toggle
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navRight = document.querySelector('.nav-right');
    
    menuToggle.addEventListener('click', () => {
        navRight.classList.toggle('active');
        
        // Animate the hamburger to X
        const bars = menuToggle.querySelectorAll('.bar');
        bars.forEach(bar => bar.classList.toggle('active'));
    });
    
    // Close menu when clicking a link
    const navLinks = navRight.querySelectorAll('a, button');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navRight.classList.contains('active')) {
                navRight.classList.remove('active');
                
                const bars = menuToggle.querySelectorAll('.bar');
                bars.forEach(bar => bar.classList.remove('active'));
            }
        });
    });
}

// DORA Metrics Charts with Chart.js
function setupDoraCharts() {
    // Chart configuration options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                },
                ticks: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                }
            },
            x: {
                grid: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                },
                ticks: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };
    
    // Common dataset config
    const commonDatasetConfig = {
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
        pointBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
        pointRadius: 4,
        pointHoverRadius: 6
    };
    
    // Deployment Frequency Chart (Higher is better)
    const deploymentData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
            ...commonDatasetConfig,
            label: 'Deployments per Week',
            data: [3, 5, 8, 12],
            backgroundColor: 'rgba(74, 111, 165, 0.2)',
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color')
        }]
    };
    
    // Lead Time Chart (Lower is better)
    const leadTimeData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
            ...commonDatasetConfig,
            label: 'Hours from Commit to Deploy',
            data: [48, 36, 24, 12],
            backgroundColor: 'rgba(247, 179, 43, 0.2)',
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color')
        }]
    };
    
    // MTTR Chart (Lower is better)
    const mttrData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
            ...commonDatasetConfig,
            label: 'Mean Time to Recover (Hours)',
            data: [8, 6, 3, 1.5],
            backgroundColor: 'rgba(109, 157, 197, 0.2)',
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color')
        }]
    };
    
    // Change Failure Rate Chart (Lower is better)
    const changeFailureData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
            ...commonDatasetConfig,
            label: 'Percentage of Deployments Causing Outages',
            data: [15, 12, 8, 5],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: '#ff6384'
        }]
    };
    
    // Create charts
    new Chart(document.getElementById('deploymentChart'), {
        type: 'line',
        data: deploymentData,
        options: {
            ...chartOptions,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} deployments per week`;
                        }
                    }
                }
            }
        }
    });
    
    new Chart(document.getElementById('leadTimeChart'), {
        type: 'line',
        data: leadTimeData,
        options: {
            ...chartOptions,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} hours`;
                        }
                    }
                }
            }
        }
    });
    
    new Chart(document.getElementById('mttrChart'), {
        type: 'line',
        data: mttrData,
        options: {
            ...chartOptions,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} hours`;
                        }
                    }
                }
            }
        }
    });
    
    new Chart(document.getElementById('changeFailureChart'), {
        type: 'line',
        data: changeFailureData,
        options: {
            ...chartOptions,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y}%`;
                        }
                    }
                }
            }
        }
    });
}

// Update chart colors based on theme
function updateChartColors() {
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
    
    // Update all charts
    Chart.instances.forEach(chart => {
        chart.options.scales.y.grid.color = borderColor;
        chart.options.scales.x.grid.color = borderColor;
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.x.ticks.color = textColor;
        chart.update();
    });
}

// Highlight active navigation item
function highlightActiveNavItem() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-right a[href^="#"]');
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// Setup navbar scroll effect
function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Initialize animations for scroll effects
function initializeAnimations() {
    // Animate elements when they come into view
    const animateOnScroll = entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    };
    
    // Create an observer for the animation
    const observer = new IntersectionObserver(animateOnScroll, {
        root: null,
        threshold: 0.1,
        rootMargin: '-50px'
    });
    
    // Observe all timeline items
    document.querySelectorAll('.timeline-item').forEach(item => {
        observer.observe(item);
        // Initial state should be invisible
        item.classList.remove('visible');
    });
    
    // Observe skill categories
    document.querySelectorAll('.skill-category').forEach((item, index) => {
        observer.observe(item);
        // Add staggered animation delay
        item.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Observe certification badges
    document.querySelectorAll('.cert-badge').forEach((item, index) => {
        observer.observe(item);
        // Add staggered animation delay
        item.style.transitionDelay = `${index * 0.1}s`;
    });
}