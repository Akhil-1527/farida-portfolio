document.addEventListener('DOMContentLoaded', () => {
    // Check if admin mode is enabled via URL parameter
    checkAdminMode();

    // Setup photo edit functionality
    setupPhotoEdit();
});

// Check if admin mode is enabled
function checkAdminMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';

    if (isAdmin) {
        enableAdminMode();
    }
}

// Enable admin mode
function enableAdminMode() {
    // Show admin toolbar
    document.getElementById('admin-toolbar').classList.remove('hidden');

    // Add admin-mode class to body
    document.body.classList.add('admin-mode');

    // Make all editable elements clickable
    setupEditableElements();
    
    // Show a welcome toast notification
    showAdminToast('Admin Mode Activated', 'Click on any highlighted text to edit content');
}

// Show toast notification for admin mode
function showAdminToast(title, message) {
    // Create toast element if it doesn't exist
    if (!document.getElementById('admin-toast')) {
        const toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.className = 'admin-toast';
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-edit toast-icon"></i>
                <div class="toast-message">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
                <button class="toast-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Add styles for the toast
        const style = document.createElement('style');
        style.textContent = `
            .admin-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: var(--primary-color);
                color: white;
                padding: 1rem;
                border-radius: var(--radius-sm);
                box-shadow: var(--shadow);
                z-index: 2000;
                max-width: 350px;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            .admin-toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            .toast-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            .toast-icon {
                font-size: 1.5rem;
                flex-shrink: 0;
            }
            .toast-message {
                flex: 1;
            }
            .toast-message h4 {
                margin-bottom: 0.25rem;
                font-size: 1rem;
            }
            .toast-message p {
                font-size: 0.85rem;
                opacity: 0.9;
            }
            .toast-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.3s;
            }
            .toast-close:hover {
                opacity: 1;
            }
        `;
        
        document.head.appendChild(style);
        
        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Setup close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500);
        });
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            if (toast.classList.contains('show')) {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                }, 500);
            }
        }, 5000);
    }
}

// Setup editable elements
function setupEditableElements() {
    document.querySelectorAll('.editable').forEach(element => {
        element.addEventListener('click', handleEditClick);
    });
}

// Handle click on editable element
function handleEditClick(event) {
    const element = event.currentTarget;
    const fieldName = element.getAttribute('data-field');
    const currentContent = element.textContent;
    const isLargeText = element.tagName === 'P' && currentContent.length > 60;

    const input = isLargeText
        ? document.createElement('textarea')
        : document.createElement('input');

    input.value = currentContent;
    input.className = isLargeText ? 'editing-textarea' : 'editing-input';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.innerHTML = '<i class="fas fa-check"></i>';

    // Clear and append input + save button
    element.innerHTML = '';
    element.appendChild(input);
    element.appendChild(saveBtn);

    input.focus();

    saveBtn.addEventListener('click', () => {
        saveEditedContent(element, input.value, fieldName);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !isLargeText) {
            e.preventDefault();
            saveEditedContent(element, input.value, fieldName);
        }
        
        // Cancel on Escape
        if (e.key === 'Escape') {
            cancelEdit(element, currentContent);
        }
    });

    input.addEventListener('blur', (e) => {
        // Only save on blur if the click wasn't on the save button
        // This prevents double-saving and resolves a race condition
        if (!e.relatedTarget || e.relatedTarget !== saveBtn) {
            saveEditedContent(element, input.value, fieldName);
        }
    });
}

// Cancel editing and restore original content
function cancelEdit(element, originalContent) {
    element.innerHTML = originalContent;
}

// Save edited content and restore view
function saveEditedContent(element, newContent, fieldName) {
    element.innerHTML = newContent;
    localStorage.setItem(`portfolio_${fieldName}`, newContent);
    
    // If this is a contact info item, update the corresponding contact modal item
    if (fieldName === 'email' || fieldName === 'phone' || fieldName === 'linkedin') {
        const contactField = document.querySelector(`.editable[data-field="contact-${fieldName}"]`);
        if (contactField) {
            contactField.textContent = newContent;
            localStorage.setItem(`portfolio_contact-${fieldName}`, newContent);
        }
    }
    
    // Show a subtle success indicator
    showSuccessIndicator(element);
}

// Show success indicator
function showSuccessIndicator(element) {
    const indicator = document.createElement('div');
    indicator.className = 'success-indicator';
    indicator.innerHTML = '<i class="fas fa-check"></i> Saved';
    
    // Add styles if they don't exist yet
    if (!document.getElementById('success-indicator-style')) {
        const style = document.createElement('style');
        style.id = 'success-indicator-style';
        style.textContent = `
            .success-indicator {
                position: absolute;
                bottom: -30px;
                right: 0;
                background-color: var(--secondary-color);
                color: white;
                padding: 0.25rem 0.75rem;
                border-radius: var(--radius-sm);
                font-size: 0.85rem;
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                z-index: 10;
                pointer-events: none;
                display: flex;
                align-items: center;
                gap: 0.35rem;
            }
            .success-indicator.show {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
    
    element.style.position = 'relative';
    element.appendChild(indicator);
    
    // Show with animation
    setTimeout(() => {
        indicator.classList.add('show');
    }, 10);
    
    // Hide and remove after 2 seconds
    setTimeout(() => {
        indicator.classList.remove('show');
        setTimeout(() => {
            indicator.remove();
        }, 300);
    }, 2000);
}

// Setup photo edit logic
function setupPhotoEdit() {
    const overlay = document.querySelector('.edit-overlay');
    const photoModal = document.getElementById('photo-upload-modal');
    const fileInput = document.getElementById('photo-upload');
    const saveBtn = document.getElementById('save-photo');
    const cancelBtn = document.getElementById('cancel-photo');
    const closeBtns = document.querySelectorAll('.modal .modal-close');

    overlay?.addEventListener('click', () => {
        openModal(photoModal);
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(photoModal);
        });
    });

    cancelBtn.addEventListener('click', () => {
        closeModal(photoModal);
    });

    saveBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) {
            showError('Please select an image file first');
            return;
        }

        // Show loading indicator
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
        
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageData = e.target.result;
            document.getElementById('profile-photo').src = imageData;
            localStorage.setItem('portfolio_profile_photo', imageData);
            
            // Reset button state
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
            saveBtn.disabled = false;
            
            closeModal(photoModal);
        };
        
        reader.onerror = function() {
            showError('Error reading file');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
            saveBtn.disabled = false;
        };
        
        reader.readAsDataURL(file);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === photoModal) {
            closeModal(photoModal);
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && photoModal.style.display === 'block') {
            closeModal(photoModal);
        }
    });
}

// Show error message
function showError(message) {
    // Create error element if it doesn't exist
    if (!document.getElementById('admin-error')) {
        const error = document.createElement('div');
        error.id = 'admin-error';
        error.className = 'admin-error';
        
        error.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-circle error-icon"></i>
                <p>${message}</p>
                <button class="error-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(error);
        
        // Add styles for the error
        const style = document.createElement('style');
        style.textContent = `
            .admin-error {
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: #e74c3c;
                color: white;
                padding: 1rem;
                border-radius: var(--radius-sm);
                box-shadow: var(--shadow);
                z-index: 2000;
                max-width: 350px;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            .admin-error.show {
                transform: translateX(0);
                opacity: 1;
            }
            .error-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            .error-icon {
                font-size: 1.5rem;
                flex-shrink: 0;
            }
            .error-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.3s;
            }
            .error-close:hover {
                opacity: 1;
            }
        `;
        
        document.head.appendChild(style);
        
        // Show the error
        setTimeout(() => {
            error.classList.add('show');
        }, 100);
        
        // Setup close button
        const closeBtn = error.querySelector('.error-close');
        closeBtn.addEventListener('click', () => {
            error.classList.remove('show');
            setTimeout(() => {
                error.remove();
            }, 500);
        });
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            if (error.classList.contains('show')) {
                error.classList.remove('show');
                setTimeout(() => {
                    error.remove();
                }, 500);
            }
        }, 5000);
    }
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