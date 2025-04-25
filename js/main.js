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
});

// Theme Toggle
function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        
        // Save preference to localStorage
        const isDarkTheme = document.body.classList.contains('dark-theme');
        localStorage.setItem('portfolio_dark_theme', isDarkTheme);
    });
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
    const contactBtn = document.getElementById('contact-btn');
    const contactModal = document.getElementById('contact-modal');
    const closeButton = contactModal.querySelector('.close');
    
    contactBtn.addEventListener('click', () => {
        contactModal.style.display = 'block';
    });
    
    closeButton.addEventListener('click', () => {
        contactModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === contactModal) {
            contactModal.style.display = 'none';
        }
    });
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
    
    // Listen for theme changes to update chart colors
    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
        // Wait for the CSS variables to update
        setTimeout(() => {
            updateChartColors();
        }, 50);
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