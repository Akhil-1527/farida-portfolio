/**
 * admin.js - Admin mode functionality for portfolio website
 * 
 * Handles:
 * - Inline editing of all content
 * - Local storage of edits
 * - Edit icons display
 * - Profile photo uploads
 * - JSON data export
 */

// Global variable to track edited fields
let editedFields = {};

/**
 * Initialize admin functionality
 * Called when ?admin=true is detected in URL
 */
function initializeAdmin() {
    console.log('Admin mode activated');
    
    // Show admin badge
    const adminBadge = document.querySelector('.admin-badge');
    if (adminBadge) {
        adminBadge.style.display = 'block';
    }
    
    // Add edit icons to all editable elements
    addEditIcons();
    
    // Setup edit click handlers
    setupEditHandlers();
    
    // Show profile upload button
    setupProfilePhotoUpload();
    
    // Show and setup export JSON button
    setupExportButton();
    
    // Load content from localStorage
    loadContentFromLocalStorage();
}

/**
 * Add edit icons to all editable elements
 */
function addEditIcons() {
    document.querySelectorAll('.editable').forEach(el => {
        // Create edit icon
        const editIcon = document.createElement('span');
        editIcon.className = 'edit-icon';
        editIcon.innerHTML = '✎';
        
        // Add to element
        el.appendChild(editIcon);
    });
    
    // Show Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.style.display = 'block';
    }
}

/**
 * Setup edit handlers for all editable elements
 */
function setupEditHandlers() {
    // Handle edit icons click
    document.querySelectorAll('.edit-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            const editableElement = this.parentElement;
            handleElementEdit(editableElement);
        });
    });
    
    // Also handle direct editable elements clicking
    document.querySelectorAll('.editable').forEach(el => {
        el.addEventListener('click', function(e) {
            handleElementEdit(this);
            e.stopPropagation(); // Prevent triggering parent click events
        });
    });
    
    // Handle section editing (when clicking section title)
    document.querySelectorAll('.section-title').forEach(title => {
        // Find the content container that follows this title
        const sectionId = title.parentElement.parentElement.id;
        if (sectionId) {
            // Create and append edit icon
            const editIcon = document.createElement('span');
            editIcon.className = 'edit-icon';
            editIcon.innerHTML = '✎';
            title.appendChild(editIcon);
            
            // Setup click handler
            editIcon.addEventListener('click', function(e) {
                e.stopPropagation();
                const sectionContainer = document.getElementById(sectionId);
                if (sectionContainer) {
                    const editableElements = sectionContainer.querySelectorAll('.editable');
                    if (editableElements.length > 0) {
                        createEditModal(editableElements, sectionId);
                    }
                }
            });
        }
    });
}

/**
 * Handle editing of individual elements
 * @param {HTMLElement} element - The element being edited
 */
function handleElementEdit(element) {
    if (!element || !element.classList.contains('editable')) return;
    
    const currentContent = element.innerHTML;
    const fieldName = element.getAttribute('data-field');
    
    // Remove edit icon for editing
    const editIcon = element.querySelector('.edit-icon');
    let editIconHTML = '';
    if (editIcon) {
        editIconHTML = editIcon.outerHTML;
        editIcon.remove();
    }
    
    // Special handling for contact info and metrics
    if (fieldName === 'phone' || fieldName === 'email' || fieldName === 'deployment-frequency' || 
        fieldName === 'mttr' || fieldName === 'failure-rate') {
        createSimpleInPlaceEditor(element, currentContent, fieldName, editIconHTML);
        return;
    }
    
    // Standard editor for other elements
    createInPlaceEditor(element, currentContent, fieldName, editIconHTML);
}

/**
 * Create simple in-place editor for basic text elements
 * @param {HTMLElement} element - The element being edited
 * @param {string} content - Current content
 * @param {string} fieldName - Field identifier
 * @param {string} editIconHTML - HTML for edit icon
 */
function createSimpleInPlaceEditor(element, content, fieldName, editIconHTML) {
    // Get just the text content
    const textContent = element.textContent.trim();
    
    // Create inline editor
    const editorHTML = `
        <div class="editor-container">
            <input type="text" class="editor-input" value="${textContent}">
            <div class="editor-controls">
                <button class="editor-save">Save</button>
                <button class="editor-cancel">Cancel</button>
            </div>
        </div>
    `;
    
    // Replace element content with editor
    element.innerHTML = editorHTML;
    
    // Setup save and cancel buttons
    const saveBtn = element.querySelector('.editor-save');
    const cancelBtn = element.querySelector('.editor-cancel');
    
    saveBtn.addEventListener('click', function() {
        const newContent = element.querySelector('.editor-input').value;
        
        // Special handling for metrics data
        if (fieldName === 'deployment-frequency' || fieldName === 'mttr' || fieldName === 'failure-rate') {
            saveMetricValue(fieldName, newContent);
        } else {
            // Save to editedFields and localStorage
            editedFields[fieldName] = newContent;
            saveToLocalStorage();
        }
        
        // Update element
        element.innerHTML = newContent + editIconHTML;
    });
    
    cancelBtn.addEventListener('click', function() {
        // Restore original content
        element.innerHTML = content;
    });
    
    // Focus on the input
    const input = element.querySelector('.editor-input');
    if (input) {
        input.focus();
    }
}

/**
 * Create in-place editor for complex elements
 * @param {HTMLElement} element - The element being edited
 * @param {string} content - Current content
 * @param {string} fieldName - Field identifier
 * @param {string} editIconHTML - HTML for edit icon
 */
function createInPlaceEditor(element, content, fieldName, editIconHTML) {
    // Determine editor type based on content complexity
    let editorHTML;
    
    if (content.includes('<h3>') || content.includes('<ul>') || content.includes('<div class="date">') || 
        content.includes('<p>') && content.includes('<div class="tags">')) {
        // Complex HTML content - use textarea
        // Remove edit icon for editing HTML
        const contentWithoutIcon = content.replace(/<span class="edit-icon">.*?<\/span>/g, '');
        
        editorHTML = `
            <div class="editor-container">
                <textarea class="editor-textarea">${contentWithoutIcon}</textarea>
                <div class="editor-controls">
                    <button class="editor-save">Save</button>
                    <button class="editor-cancel">Cancel</button>
                </div>
            </div>
        `;
    } else {
        // Simple text content - use input
        const textContent = element.textContent.replace('✎', '').trim();
        
        editorHTML = `
            <div class="editor-container">
                <input type="text" class="editor-input" value="${textContent}">
                <div class="editor-controls">
                    <button class="editor-save">Save</button>
                    <button class="editor-cancel">Cancel</button>
                </div>
            </div>
        `;
    }
    
    // Replace element content with editor
    element.innerHTML = editorHTML;
    
    // Setup save and cancel buttons
    const saveBtn = element.querySelector('.editor-save');
    const cancelBtn = element.querySelector('.editor-cancel');
    
    saveBtn.addEventListener('click', function() {
        let newContent;
        
        if (element.querySelector('.editor-textarea')) {
            newContent = element.querySelector('.editor-textarea').value;
        } else {
            newContent = element.querySelector('.editor-input').value;
        }
        
        // Save to editedFields and localStorage
        editedFields[fieldName] = newContent;
        saveToLocalStorage();
        
        // Update element with edit icon
        element.innerHTML = newContent + editIconHTML;
    });
    
    cancelBtn.addEventListener('click', function() {
        // Restore original content
        element.innerHTML = content;
    });
    
    // Focus on the input/textarea
    const input = element.querySelector('.editor-textarea') || element.querySelector('.editor-input');
    if (input) {
        input.focus();
    }
}

/**
 * Create modal for editing multiple elements
 * @param {NodeList} elements - Collection of editable elements
 * @param {string} sectionId - ID of the section being edited
 */
function createEditModal(elements, sectionId) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    
    let modalContent = `
        <div class="edit-modal-content">
            <span class="edit-modal-close">&times;</span>
            <h2>Edit ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} Section</h2>
            <div class="edit-modal-form">
    `;
    
    // Add form fields for each editable element
    elements.forEach((el, index) => {
        const fieldName = el.getAttribute('data-field');
        if (!fieldName) return;
        
        // Clean content - remove edit icon
        let content = el.innerHTML;
        content = content.replace(/<span class="edit-icon">.*?<\/span>/g, '');
        
        const displayName = fieldName.replace(/-/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
        // Determine if we need textarea or input
        if (content.includes('<h3>') || content.includes('<ul>') || content.includes('<div class="date">') || 
            content.includes('<p>') && content.includes('<div class="tags">')) {
            // Complex content
            modalContent += `
                <div class="edit-modal-field">
                    <h3>${displayName}</h3>
                    <textarea data-field="${fieldName}" rows="6">${content}</textarea>
                </div>
            `;
        } else {
            // Simple content
            const textContent = el.textContent.replace('✎', '').trim();
            modalContent += `
                <div class="edit-modal-field">
                    <h3>${displayName}</h3>
                    <input type="text" data-field="${fieldName}" value="${textContent}">
                </div>
            `;
        }
    });
    
    // Add save and cancel buttons
    modalContent += `
            </div>
            <div class="edit-modal-controls">
                <button class="edit-modal-save">Save All</button>
                <button class="edit-modal-cancel">Cancel</button>
            </div>
        </div>
    `;
    
    modal.innerHTML = modalContent;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Setup event handlers
    const closeBtn = modal.querySelector('.edit-modal-close');
    const saveBtn = modal.querySelector('.edit-modal-save');
    const cancelBtn = modal.querySelector('.edit-modal-cancel');
    
    // Close modal function
    const closeModal = () => document.body.removeChild(modal);
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            // Save all fields
            const inputFields = modal.querySelectorAll('input[data-field]');
            const textareaFields = modal.querySelectorAll('textarea[data-field]');
            
            // Process input fields
            inputFields.forEach(field => {
                const fieldName = field.getAttribute('data-field');
                const newContent = field.value;
                
                // Save to editedFields and localStorage
                editedFields[fieldName] = newContent;
                
                // Update element on page
                const pageElement = document.querySelector(`[data-field="${fieldName}"]`);
                if (pageElement) {
                    // Preserve edit icon
                    const editIcon = pageElement.querySelector('.edit-icon');
                    const editIconHTML = editIcon ? editIcon.outerHTML : '';
                    pageElement.innerHTML = newContent + editIconHTML;
                }
            });
            
            // Process textarea fields
            textareaFields.forEach(field => {
                const fieldName = field.getAttribute('data-field');
                const newContent = field.value;
                
                // Save to editedFields and localStorage
                editedFields[fieldName] = newContent;
                
                // Update element on page
                const pageElement = document.querySelector(`[data-field="${fieldName}"]`);
                if (pageElement) {
                    // Preserve edit icon
                    const editIcon = pageElement.querySelector('.edit-icon');
                    const editIconHTML = editIcon ? editIcon.outerHTML : '';
                    pageElement.innerHTML = newContent + editIconHTML;
                }
            });
            
            // Save all changes to localStorage
            saveToLocalStorage();
            
            // Close modal
            closeModal();
        });
    }
}

/**
 * Save metric value and update charts
 * @param {string} fieldName - Metric field name
 * @param {string} value - New value
 */
function saveMetricValue(fieldName, value) {
    // Get existing metrics data
    let metricsData = JSON.parse(localStorage.getItem('metricsData')) || {};
    
    // Update the appropriate field
    if (fieldName === 'deployment-frequency') {
        metricsData.deploymentFrequency = value;
    } else if (fieldName === 'mttr') {
        metricsData.mttr = value;
    } else if (fieldName === 'failure-rate') {
        metricsData.failureRate = value;
        
        // Also update current failure rate for doughnut chart
        // Remove % if present and convert to number
        const numericValue = parseFloat(value.replace('%', ''));
        if (!isNaN(numericValue)) {
            metricsData.failure.current = numericValue;
        }
    }
    
    // Save back to localStorage
    localStorage.setItem('metricsData', JSON.stringify(metricsData));
    
    console.log(`Saved metric value for ${fieldName}: ${value}`);
    
    // Refresh charts with new data
    if (typeof initializeDoraMetrics === 'function') {
        initializeDoraMetrics();
    }
}

/**
 * Setup profile photo upload functionality
 */
function setupProfilePhotoUpload() {
    const profileUpload = document.getElementById('profileUpload');
    const profileInput = document.getElementById('profileInput');
    const profilePhoto = document.getElementById('profilePhoto');
    const logoImg = document.querySelector('.logo img');
    
    if (profileUpload && profileInput && profilePhoto) {
        // Show upload button in admin mode
        profileUpload.style.display = 'flex';
        
        // Handle upload button click
        profileUpload.addEventListener('click', function() {
            profileInput.click();
        });
        
        // Handle file selection
        profileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                // When file is loaded
                reader.onload = function(e) {
                    // Update profile photo
                    profilePhoto.src = e.target.result;
                    
                    // Also update small logo photo if it exists
                    if (logoImg) {
                        logoImg.src = e.target.result;
                    }
                    
                    // Save to localStorage
                    localStorage.setItem('profilePhoto', e.target.result);
                };
                
                // Read the file
                reader.readAsDataURL(this.files[0]);
            }
        });
        
        // Load existing profile photo from localStorage
        const savedPhoto = localStorage.getItem('profilePhoto');
        if (savedPhoto) {
            profilePhoto.src = savedPhoto;
            
            // Also update small logo photo if it exists
            if (logoImg) {
                logoImg.src = savedPhoto;
            }
        }
    }
}

/**
 * Setup export button functionality
 */
function setupExportButton() {
    const exportBtn = document.getElementById('exportBtn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            // Get data from localStorage
            const portfolioData = editedFields || {};
            const metricsData = JSON.parse(localStorage.getItem('metricsData')) || {};
            const profilePhoto = localStorage.getItem('profilePhoto');
            
            // Combine all data
            const exportData = {
                timestamp: new Date().toISOString(),
                portfolioContent: portfolioData,
                metricsData: metricsData,
                profilePhoto: profilePhoto
            };
            
            // Create download link
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "portfolio-data.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
        });
    }
}

/**
 * Save all edited fields to localStorage
 */
function saveToLocalStorage() {
    localStorage.setItem('portfolioData', JSON.stringify(editedFields));
    console.log('Saved all changes to localStorage');
}

/**
 * Load content from localStorage
 */
function loadContentFromLocalStorage() {
    // Load portfolio content
    const portfolioData = JSON.parse(localStorage.getItem('portfolioData'));
    
    if (portfolioData) {
        // Store in editedFields
        editedFields = portfolioData;
        
        // Update all editable elements with stored content
        Object.keys(portfolioData).forEach(fieldName => {
            const element = document.querySelector(`[data-field="${fieldName}"]`);
            
            if (element) {
                // Get edit icon if it exists
                const editIcon = element.querySelector('.edit-icon');
                const editIconHTML = editIcon ? editIcon.outerHTML : '';
                
                // Update content preserving edit icon
                element.innerHTML = portfolioData[fieldName] + editIconHTML;
            }
        });
    }
    
    // Load profile photo
    const profilePhoto = localStorage.getItem('profilePhoto');
    if (profilePhoto) {
        const photoElement = document.getElementById('profilePhoto');
        const logoImg = document.querySelector('.logo img');
        
        if (photoElement) {
            photoElement.src = profilePhoto;
        }
        
        if (logoImg) {
            logoImg.src = profilePhoto;
        }
    }
}