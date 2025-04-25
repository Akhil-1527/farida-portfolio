/**
 * main.js - Core functionality for Mohammad Abdul Faridajalal's portfolio
 * Handles theme, navigation, charts, contact modal, and smooth scrolling
 */

// Initialize charts, theme, mobile menu, and modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize contact modal
    initContactModal();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize charts
    initCharts();
    
    // Load profile image from localStorage if available (for non-admin view)
    loadProfileImage();
  });
  
  /**
   * Theme Handling
   */
  function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      document.documentElement.setAttribute('data-theme', storedTheme);
    } else {
      // Check system preference
      const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDarkScheme) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    }
    
    // Add event listener for theme toggle
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Reinitialize charts when theme changes to update colors
      initCharts();
    });
  }
  
  /**
   * Mobile Menu Handling
   */
  function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('menu-open');
      menu.classList.toggle('show');
    });
    
    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('menu-open');
        menu.classList.remove('show');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !menuToggle.contains(e.target) && menu.classList.contains('show')) {
        menuToggle.classList.remove('menu-open');
        menu.classList.remove('show');
      }
    });
  }
  
  /**
   * Contact Modal Handling
   */
  function initContactModal() {
    const contactBtn = document.getElementById('contactBtn');
    const contactModal = document.getElementById('contactModal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (!contactBtn || !contactModal || !closeBtn) return;
    
    contactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      contactModal.classList.add('show');
    });
    
    // Close when clicking the X button
    closeBtn.addEventListener('click', () => {
      contactModal.classList.remove('show');
    });
    
    // Close when clicking outside the modal
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        contactModal.classList.remove('show');
      }
    });
    
    // Close when pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && contactModal.classList.contains('show')) {
        contactModal.classList.remove('show');
      }
    });
  }
  
  /**
   * Smooth Scrolling for Navigation
   */
  function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]:not(#contactBtn)');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Prevent default behavior
        e.preventDefault();
        
        // Get the target section
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          // Account for fixed header
          const headerHeight = document.querySelector('header').offsetHeight;
          const targetPosition = targetSection.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
  
  /**
   * Load profile image from localStorage for non-admin view
   */
  function loadProfileImage() {
    const savedProfileImage = localStorage.getItem('portfolio_profileImage');
    if (savedProfileImage) {
      const profileImage = document.getElementById('profileImage');
      const logoImg = document.getElementById('logoImg');
      
      if (profileImage) profileImage.src = savedProfileImage;
      if (logoImg) logoImg.src = savedProfileImage;
    }
    
    // Load editable content from localStorage for non-admin view
    loadEditableContent();
  }
  
  /**
   * Load editable content from localStorage for non-admin view
   */
  function loadEditableContent() {
    const editableElements = document.querySelectorAll('.editable');
    
    editableElements.forEach(element => {
      const fieldName = element.getAttribute('data-field');
      if (!fieldName) return;
      
      const savedContent = localStorage.getItem(`portfolio_${fieldName}`);
      if (savedContent) {
        if (element.tagName.toLowerCase() === 'img') {
          element.src = savedContent;
        } else {
          element.textContent = savedContent;
        }
      }
    });
    
    // Update page title if logoText was changed
    const logoText = localStorage.getItem('portfolio_logoText');
    if (logoText) {
      document.title = `${logoText} - Azure DevOps | SRE`;
    }
  }
  
  /**
   * DORA Metrics Charts
   */
  function initCharts() {
    // Get theme-based colors for charts
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDarkTheme ? '#f0f0f0' : '#333333';
    const gridColor = isDarkTheme ? '#3d3d3d' : '#e0e0e0';
    
    // Common chart options
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
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
      }
    };
    
    // Load metrics data from localStorage or use defaults
    const metricsData = loadMetricsData();
    
    // Initialize all charts
    createDeploymentFrequencyChart(metricsData.deploymentFrequency, chartOptions);
    createLeadTimeChart(metricsData.leadTime, chartOptions);
    createMTTRChart(metricsData.mttr, chartOptions);
    createChangeFailureChart(metricsData.changeFailure, chartOptions);
  }
  
  /**
   * Load metrics data from localStorage or return defaults
   */
  function loadMetricsData() {
    let data;
    
    try {
      const storedData = localStorage.getItem('metricsData');
      data = storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error('Error loading metrics data from localStorage:', error);
      data = null;
    }
    
    // Return stored data or defaults
    return data || {
      deploymentFrequency: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        before: [3, 3, 4, 3, 5, 4],
        after: [15, 18, 22, 25, 28, 30]
      },
      leadTime: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        before: [120, 110, 130, 100, 90, 95],
        after: [60, 50, 40, 30, 25, 20]
      },
      mttr: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        before: [180, 165, 175, 190, 170, 160],
        after: [90, 85, 70, 65, 60, 55]
      },
      changeFailure: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        before: [25, 28, 22, 24, 27, 25],
        after: [15, 12, 10, 8, 6, 5]
      }
    };
  }
  
  /**
   * Create Deployment Frequency Chart
   */
  function createDeploymentFrequencyChart(data, options) {
    const canvas = document.getElementById('deploymentFrequencyChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Check if chart already exists and destroy it
    if (window.deploymentFrequencyChart) {
      window.deploymentFrequencyChart.destroy();
    }
    
    window.deploymentFrequencyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Before',
            data: data.before,
            backgroundColor: 'rgba(220, 53, 69, 0.7)',
            borderColor: 'rgba(220, 53, 69, 1)',
            borderWidth: 1
          },
          {
            label: 'After',
            data: data.after,
            backgroundColor: 'rgba(25, 135, 84, 0.7)',
            borderColor: 'rgba(25, 135, 84, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        ...options,
        plugins: {
          ...options.plugins,
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y + ' per month';
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Create Lead Time for Changes Chart
   */
  function createLeadTimeChart(data, options) {
    const canvas = document.getElementById('leadTimeChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Check if chart already exists and destroy it
    if (window.leadTimeChart) {
      window.leadTimeChart.destroy();
    }
    
    window.leadTimeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Before',
            data: data.before,
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            borderColor: 'rgba(220, 53, 69, 1)',
            borderWidth: 2,
            tension: 0.3
          },
          {
            label: 'After',
            data: data.after,
            backgroundColor: 'rgba(25, 135, 84, 0.2)',
            borderColor: 'rgba(25, 135, 84, 1)',
            borderWidth: 2,
            tension: 0.3
          }
        ]
      },
      options: {
        ...options,
        plugins: {
          ...options.plugins,
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y + ' minutes';
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Create Mean Time to Recovery Chart
   */
  function createMTTRChart(data, options) {
    const canvas = document.getElementById('mttrChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Check if chart already exists and destroy it
    if (window.mttrChart) {
      window.mttrChart.destroy();
    }
    
    window.mttrChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Before',
            data: data.before,
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            borderColor: 'rgba(220, 53, 69, 1)',
            borderWidth: 2,
            tension: 0.3
          },
          {
            label: 'After',
            data: data.after,
            backgroundColor: 'rgba(25, 135, 84, 0.2)',
            borderColor: 'rgba(25, 135, 84, 1)',
            borderWidth: 2,
            tension: 0.3
          }
        ]
      },
      options: {
        ...options,
        plugins: {
          ...options.plugins,
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y + ' minutes';
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Create Change Failure Rate Chart
   */
  function createChangeFailureChart(data, options) {
    const canvas = document.getElementById('changeFailureChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Check if chart already exists and destroy it
    if (window.changeFailureChart) {
      window.changeFailureChart.destroy();
    }
    
    window.changeFailureChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Before',
            data: data.before,
            backgroundColor: 'rgba(220, 53, 69, 0.7)',
            borderColor: 'rgba(220, 53, 69, 1)',
            borderWidth: 1
          },
          {
            label: 'After',
            data: data.after,
            backgroundColor: 'rgba(25, 135, 84, 0.7)',
            borderColor: 'rgba(25, 135, 84, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        ...options,
        plugins: {
          ...options.plugins,
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y + '%';
              }
            }
          }
        }
      }
    });
  }