// main.js - Core functionality for Mohammad Abdul Faridajalal's portfolio website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme from localStorage
    initializeTheme();
    
    // Setup mobile menu toggle
    setupMobileMenu();
    
    // Initialize DORA metrics charts
    initializeDoraMetrics();
    
    // Setup contact modal
    setupContactModal();
    
    // Check if in admin mode and initialize if needed
    checkAdminMode();
});

// Theme Toggle Functionality
function initializeTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme from localStorage
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        if (document.body.getAttribute('data-theme') === 'dark') {
            // Switch to light theme
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            // Switch to dark theme
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        // Reinitialize charts with new theme colors
        initializeDoraMetrics();
    });
}

// Mobile Menu Functionality
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', function() {
        // Toggle navigation links visibility
        navLinks.classList.toggle('active');
        
        // Toggle between bars and X icon
        const icon = this.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            
            // Reset icon to bars
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// Initialize DORA Metrics Charts
function initializeDoraMetrics() {
    // Get metrics data from localStorage or use default values
    const metricsData = getMetricsData();
    
    // Setup chart colors based on current theme
    const chartColors = getChartColors();
    
    // Clear existing charts if they exist
    if (window.deploymentChart) window.deploymentChart.destroy();
    if (window.recoveryChart) window.recoveryChart.destroy();
    if (window.failureChart) window.failureChart.destroy();
    
    // Deployment Frequency Chart (Bar Chart)
    const deploymentCtx = document.getElementById('deploymentChart').getContext('2d');
    window.deploymentChart = new Chart(deploymentCtx, {
        type: 'bar',
        data: {
            labels: metricsData.deployment.labels,
            datasets: [{
                label: 'Deployments',
                data: metricsData.deployment.data,
                backgroundColor: chartColors.deployment.background,
                borderColor: chartColors.deployment.border,
                borderWidth: 2
            }]
        },
        options: getChartOptions('Weekly Deployments')
    });
    
    // Mean Time to Recovery Chart (Bar Chart)
    const recoveryCtx = document.getElementById('recoveryChart').getContext('2d');
    window.recoveryChart = new Chart(recoveryCtx, {
        type: 'bar',
        data: {
            labels: metricsData.recovery.labels,
            datasets: [{
                label: 'MTTR (minutes)',
                data: metricsData.recovery.data,
                backgroundColor: chartColors.recovery.background,
                borderColor: chartColors.recovery.border,
                borderWidth: 2
            }]
        },
        options: getChartOptions('Recovery Time (min)')
    });
    
    // Change Failure Rate Chart (Doughnut Chart)
    const failureCtx = document.getElementById('failureChart').getContext('2d');
    window.failureChart = new Chart(failureCtx, {
        type: 'doughnut',
        data: {
            labels: ['Success Rate', 'Failure Rate'],
            datasets: [{
                data: [100 - metricsData.failure.current, metricsData.failure.current],
                backgroundColor: [
                    chartColors.failure.success,
                    chartColors.failure.failure
                ],
                borderColor: [
                    chartColors.failure.successBorder,
                    chartColors.failure.failureBorder
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-color')
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.formattedValue + '%';
                        }
                    }
                }
            }
        }
    });
    
    // Update text metrics values
    updateTextMetrics(metricsData);
}

// Get chart colors based on current theme
function getChartColors() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    return {
        deployment: {
            background: isDark ? 'rgba(44, 159, 255, 0.2)' : 'rgba(0, 120, 212, 0.2)',
            border: isDark ? 'rgba(44, 159, 255, 1)' : 'rgba(0, 120, 212, 1)'
        },
        recovery: {
            background: isDark ? 'rgba(255, 99, 132, 0.2)' : 'rgba(255, 99, 132, 0.2)',
            border: isDark ? 'rgba(255, 99, 132, 1)' : 'rgba(255, 99, 132, 1)'
        },
        failure: {
            success: isDark ? 'rgba(46, 204, 113, 0.8)' : 'rgba(46, 204, 113, 0.8)',
            failure: isDark ? 'rgba(231, 76, 60, 0.8)' : 'rgba(231, 76, 60, 0.8)',
            successBorder: isDark ? 'rgba(46, 204, 113, 1)' : 'rgba(46, 204, 113, 1)',
            failureBorder: isDark ? 'rgba(231, 76, 60, 1)' : 'rgba(231, 76, 60, 1)'
        }
    };
}

// Update text metrics displayed on the dashboard
function updateTextMetrics(metricsData) {
    const deploymentFreq = document.querySelector('[data-field="deployment-frequency"]');
    if (deploymentFreq) {
        deploymentFreq.textContent = metricsData.deploymentFrequency;
    }
    
    const mttr = document.querySelector('[data-field="mttr"]');
    if (mttr) {
        mttr.textContent = metricsData.mttr;
    }
    
    const failureRate = document.querySelector('[data-field="failure-rate"]');
    if (failureRate) {
        failureRate.textContent = metricsData.failureRate;
    }
}

// Chart Configuration Options for bar and line charts
function getChartOptions(yAxisLabel) {
    const textColor = getComputedStyle(document.body).getPropertyValue('--text-color');
    const borderColor = getComputedStyle(document.body).getPropertyValue('--border-color');
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: yAxisLabel,
                    color: textColor
                },
                grid: {
                    color: borderColor
                },
                ticks: {
                    color: textColor
                }
            },
            x: {
                grid: {
                    color: borderColor
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
}

// Get metrics data from localStorage or use defaults
function getMetricsData() {
    const storedData = localStorage.getItem('metricsData');
    
    if (storedData) {
        return JSON.parse(storedData);
    }
    
    // Default metrics data
    const defaultData = {
        deploymentFrequency: '5',
        mttr: '90',
        failureRate: '4.3%',
        deployment: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'],
            data: [3, 4, 5, 6, 5]
        },
        recovery: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [120, 110, 100, 95, 92, 90]
        },
        failure: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [7.2, 6.8, 5.5, 4.9, 4.5, 4.3],
            current: 4.3 // Current failure rate for doughnut chart
        }
    };
    
    // Save default data to localStorage
    localStorage.setItem('metricsData', JSON.stringify(defaultData));
    
    return defaultData;
}

// Setup Contact Modal Functionality
function setupContactModal() {
    const contactBtn = document.getElementById('contactBtn');
    const contactModal = document.getElementById('contactModal');
    const closeModal = document.getElementById('closeModal');
    
    if (contactBtn && contactModal) {
        // Open modal when contact button is clicked
        contactBtn.addEventListener('click', function(e) {
            e.preventDefault();
            contactModal.style.display = 'flex';
        });
        
        // Close modal with X button
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                contactModal.style.display = 'none';
            });
        }
        
        // Close modal when clicking on overlay (outside the modal)
        contactModal.addEventListener('click', function(e) {
            if (e.target === contactModal) {
                contactModal.style.display = 'none';
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && contactModal.style.display === 'flex') {
                contactModal.style.display = 'none';
            }
        });
    }
}

// Check if in admin mode
function checkAdminMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';
    
    if (isAdmin) {
        // Initialize admin functionality (loaded from admin.js)
        if (typeof initializeAdmin === 'function') {
            initializeAdmin();
        } else {
            console.error('Admin functionality not available. Make sure admin.js is loaded.');
        }
    }
}

// Skill cards interaction
document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('click', function() {
        // Toggle details visibility on mobile (as an alternative to hover)
        if (window.innerWidth <= 768) {
            const details = this.querySelector('.skill-details');
            details.style.display = details.style.display === 'flex' ? 'none' : 'flex';
        }
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        
        // Skip for contact button which opens modal
        if (targetId === '#' || this.id === 'contactBtn') {
            return;
        }
        
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});