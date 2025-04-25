// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin mode is enabled and load admin.js
    checkAdminMode();
    
    // Initialize theme
    initTheme();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize contact modal
    initContactModal();
    
    // Initialize charts
    initCharts();
    
    // Load content from localStorage (for both public and admin mode)
    loadContentFromLocalStorage();
    
    // Initialize profile image
    initProfileImage();
});

/**
 * Check if admin mode is enabled and load admin.js dynamically
 */
function checkAdminMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';
    
    if (isAdmin) {
        // Show admin toolbar
        document.getElementById('admin-toolbar').style.display = 'block';
        
        // Load admin.js dynamically
        const script = document.createElement('script');
        script.src = 'admin.js';
        script.onload = function() {
            // Call initializeAdmin only after script is loaded
            if (typeof initializeAdmin === 'function') {
                initializeAdmin();
            }
        };
        document.body.appendChild(script);
        
        // Show image upload functionality
        const imageUploadOverlay = document.querySelector('.image-upload-overlay');
        if (imageUploadOverlay) {
            imageUploadOverlay.style.display = 'flex';
        }
    }
}

/**
 * Initialize theme toggle functionality
 */
function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const savedTheme = localStorage.getItem('portfolio_theme');
    
    // Apply saved theme if it exists
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        updateChartTheme(true);
    }
    
    // Toggle theme on click
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const isDarkTheme = document.body.classList.contains('dark-theme');
        
        // Update charts when theme changes
        updateChartTheme(isDarkTheme);
        
        // Save theme preference
        localStorage.setItem('portfolio_theme', isDarkTheme ? 'dark' : 'light');
    });
}

/**
 * Update chart colors based on theme
 */
function updateChartTheme(isDarkTheme) {
    const textColor = isDarkTheme ? '#e2e8f0' : '#334155';
    const gridColor = isDarkTheme ? '#334155' : '#e2e8f0';
    
    // Update all charts
    if (window.deploymentChart) {
        updateSingleChartTheme(window.deploymentChart, textColor, gridColor);
    }
    if (window.leadTimeChart) {
        updateSingleChartTheme(window.leadTimeChart, textColor, gridColor);
    }
    if (window.mttrChart) {
        updateSingleChartTheme(window.mttrChart, textColor, gridColor);
    }
    if (window.failureRateChart) {
        updateSingleChartTheme(window.failureRateChart, textColor, gridColor);
    }
}

/**
 * Update a single chart's theme
 */
function updateSingleChartTheme(chart, textColor, gridColor) {
    chart.options.scales.x.grid.color = gridColor;
    chart.options.scales.x.ticks.color = textColor;
    chart.options.scales.y.grid.color = gridColor;
    chart.options.scales.y.ticks.color = textColor;
    chart.options.plugins.legend.labels.color = textColor;
    chart.update();
}

/**
 * Initialize section navigation
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get section to show
            const sectionId = this.getAttribute('data-section');
            
            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Show selected section
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

/**
 * Initialize contact modal
 */
function initContactModal() {
    const contactBtn = document.getElementById('contact-btn');
    const contactModal = document.getElementById('contact-modal');
    const closeBtn = document.querySelector('.close-btn');
    
    // Show modal when contact button is clicked
    contactBtn.addEventListener('click', function(e) {
        e.preventDefault();
        contactModal.style.display = 'block';
    });
    
    // Hide modal when close button is clicked
    closeBtn.addEventListener('click', function() {
        contactModal.style.display = 'none';
    });
    
    // Hide modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (e.target === contactModal) {
            contactModal.style.display = 'none';
        }
    });
}

/**
 * Initialize DORA metrics charts
 */
function initCharts() {
    const isDarkTheme = document.body.classList.contains('dark-theme');
    const textColor = isDarkTheme ? '#e2e8f0' : '#334155';
    const gridColor = isDarkTheme ? '#334155' : '#e2e8f0';
    
    // Common chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    color: gridColor
                },
                ticks: {
                    color: textColor
                }
            },
            y: {
                grid: {
                    color: gridColor
                },
                ticks: {
                    color: textColor
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        }
    };
    
    // Deployment Frequency Chart
    const deploymentCtx = document.getElementById('deploymentChart').getContext('2d');
    window.deploymentChart = new Chart(deploymentCtx, {
        type: 'bar',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Deployments per week',
                data: [3, 5, 8, 12],
                backgroundColor: '#3b82f6'
            }]
        },
        options: commonOptions
    });
    
    // Lead Time Chart
    const leadTimeCtx = document.getElementById('leadTimeChart').getContext('2d');
    window.leadTimeChart = new Chart(leadTimeCtx, {
        type: 'line',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Hours',
                data: [48, 36, 24, 12],
                borderColor: '#8b5cf6',
                tension: 0.3,
                fill: false
            }]
        },
        options: commonOptions
    });
    
    // MTTR Chart
    const mttrCtx = document.getElementById('mttrChart').getContext('2d');
    window.mttrChart = new Chart(mttrCtx, {
        type: 'line',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Hours',
                data: [8, 6, 3, 1.5],
                borderColor: '#10b981',
                tension: 0.3,
                fill: false
            }]
        },
        options: commonOptions
    });
    
    // Change Failure Rate Chart
    const failureRateCtx = document.getElementById('failureRateChart').getContext('2d');
    window.failureRateChart = new Chart(failureRateCtx, {
        type: 'bar',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Percentage',
                data: [15, 12, 8, 5],
                backgroundColor: '#ef4444'
            }]
        },
        options: commonOptions
    });
}

/**
 * Load saved content from localStorage
 */
function loadContentFromLocalStorage() {
    const editableElements = document.querySelectorAll('.editable');
    
    editableElements.forEach(element => {
        const fieldName = element.getAttribute('data-field');
        const savedContent = localStorage.getItem(`portfolio_${fieldName}`);
        
        if (savedContent) {
            element.innerHTML = savedContent;
        }
    });
    
    // Load profile image if saved
    const savedImage = localStorage.getItem('portfolio_profile_image');
    if (savedImage) {
        document.getElementById('profile-image').src = savedImage;
    }
}

/**
 * Initialize profile image functionality
 */
function initProfileImage() {
    const imageUpload = document.getElementById('image-upload');
    const profileImage = document.getElementById('profile-image');
    
    // Handle image upload
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imageData = e.target.result;
                profileImage.src = imageData;
                
                // Save image to localStorage
                localStorage.setItem('portfolio_profile_image', imageData);
            };
            
            reader.readAsDataURL(file);
        }
    });
}