/**
 * Utility functions for the portfolio application
 */

/**
 * Shows or hides the page loader
 * @param {boolean} show - Whether to show or hide the loader
 */
export function toggleLoader(show) {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;
    
    if (show) {
        loader.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
    }
}

/**
 * Shows an error toast notification
 * @param {string} message - The error message to display
 */
export function showError(message) {
    const toast = document.getElementById('error-toast');
    if (!toast) return;
    
    const messageEl = toast.querySelector('.toast-message');
    if (messageEl) {
        messageEl.textContent = message;
    }
    
    toast.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

/**
 * Shows a success toast notification
 * @param {string} message - The success message to display
 */
export function showSuccess(message) {
    const toast = document.getElementById('success-toast');
    if (!toast) return;
    
    const messageEl = toast.querySelector('.toast-message');
    if (messageEl) {
        messageEl.textContent = message;
    }
    
    toast.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

/**
 * Toggle modal display
 * @param {HTMLElement} modal - The modal element
 * @param {boolean} show - Whether to show or hide the modal
 */
export function toggleModal(modal, show) {
    if (!modal) return;
    
    if (show) {
        modal.classList.add('active');
    } else {
        modal.classList.remove('active');
    }
}

/**
 * Check if an element is in the viewport
 * @param {HTMLElement} el - The element to check
 * @returns {boolean} - Whether the element is in the viewport
 */
export function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
        rect.bottom >= 0 &&
        rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
        rect.right >= 0
    );
}