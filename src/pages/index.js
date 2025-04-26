/**
 * Main entry point for public portfolio page
 */
import { initTheme } from '../core/theme.js';
import { loadAllContent } from '../data/aws-database.js';
import { getProfilePhotoUrl } from '../data/aws-storage.js';
import { initCharts } from '../components/charts.js';
import { initTimeline } from '../components/timeline.js';
import { toggleLoader, isElementInViewport } from '../core/utils.js';
import { renderHome } from '../templates/home-template.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize AWS
    await initAWS();
    
    // Initialize theme handling
    initTheme();
    
    // Load and render content
    await loadAndRenderContent();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize animations
    initAnimations();
});

/**
 * Initialize AWS configuration
 */
async function initAWS() {
    try {
        // Configure AWS region
        AWS.config.region = 'us-east-1';
        
        // Configure anonymous credentials for public access
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
        });
        
        // Wait for credentials to be set
        await new Promise((resolve, reject) => {
            AWS.config.credentials.get(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        
        console.log('AWS initialized for public access');
    } catch (error) {
        console.error('Error initializing AWS:', error);
        throw error;
    }
}

/**
 * Load content and render the page
 */
async function loadAndRenderContent() {
    try {
        toggleLoader(true);
        
        // Load content from DynamoDB
        const content = await loadAllContent();
        
        // Load profile photo from S3
        const profilePhotoUrl = await getProfilePhotoUrl();
        
        // Render the home page
        renderHome(content, profilePhotoUrl);
        
        // Initialize charts
        initCharts();
        
        // Initialize timeline animations
        initTimeline();
        
        // Hide loader
        setTimeout(() => {
            toggleLoader(false);
            
            // Fade in the main content
            document.body.classList.remove('loading');
            
            // Trigger initial scroll animations
            checkScrollAnimations();
        }, 500);
    } catch (error) {
        console.error('Error loading content:', error);
        toggleLoader(false);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Contact modal
    const contactBtn = document.getElementById('contact-btn');
    const heroContactBtn = document.getElementById('hero-contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', openContactModal);
    }
    if (heroContactBtn) {
        heroContactBtn.addEventListener('click', openContactModal);
    }
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const links = navLinks.querySelectorAll('a, button');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const offsetTop = targetElement.offsetTop;
                
                window.scrollTo({
                    top: offsetTop - 80, // Account for header height
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Toast close buttons
    document.querySelectorAll('.toast-close').forEach(close => {
        close.addEventListener('click', (e) => {
            const toast = e.currentTarget.closest('.toast');
            if (toast) {
                toast.classList.remove('show');
            }
        });
    });
}

/**
 * Open contact modal
 */
function openContactModal() {
    const modal = document.getElementById('contact-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    
    // Close modal when clicking outside or on close button
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

/**
 * Initialize animations
 */
function initAnimations() {
    // Listen for scroll events to trigger animations
    window.addEventListener('scroll', checkScrollAnimations);
    
    // Apply animations to elements with specific animation classes
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
    });
    
    document.querySelectorAll('.skill-category').forEach((category, index) => {
        category.classList.add('animate-on-scroll');
        category.style.transitionDelay = `${index * 0.1}s`;
    });
    
    document.querySelectorAll('.cert-badge').forEach((badge, index) => {
        badge.classList.add('animate-on-scroll');
        badge.style.transitionDelay = `${index * 0.1}s`;
    });
}

/**
 * Check for elements to animate on scroll
 */
function checkScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        if (isElementInViewport(element)) {
            element.classList.add('in-view');
        }
    });
    
    // Also animate timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        if (isElementInViewport(item)) {
            item.classList.add('in-view');
        }
    });
    
    // Animate education cards
    const educationCards = document.querySelectorAll('.education-card');
    educationCards.forEach(card => {
        if (isElementInViewport(card)) {
            card.classList.add('in-view');
        }
    });
}