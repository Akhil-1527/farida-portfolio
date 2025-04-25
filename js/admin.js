/**
 * Admin Mode Functionality
 * This script adds inline editing capabilities to the portfolio site.
 * It's loaded dynamically when ?admin=true is in the URL.
 */

/**
 * Initialize admin functionality
 */
function initializeAdmin() {
    console.log('Admin mode initialized');
    
    // Add edit icons to all editable elements
    addEditIcons();
    
    // Add event listeners for edit icons
    setupEditFunctionality();
}

/**
 * Add edit icons to all editable elements
 */
function addEditIcons() {
    const editableElements = document.querySelectorAll('.editable');
    
    editableElements.forEach(element => {
        const editIcon = document.createElement('span');
        editIcon.className = 'edit-icon';
        editIcon.innerHTML = '✏️';
        editIcon.title = 'Edit this content';
        
        element.appendChild(editIcon);
    });
}

/**
 * Setup event listeners for edit functionality
 */
function setupEditFunctionality() {
    const editIcons = document.querySelectorAll('.edit-icon');
    
    editIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const editableElement = this.parentElement;
            enterEditMode(editableElement);
        });
    });
}

/**
 * Enter edit mode for an element
 * @param {HTMLElement} element - The editable element
 */
function enterEditMode(element) {
    // Store original content in case user cancels
    const originalContent = element.innerHTML;
    const fieldName = element.getAttribute('data-field');
    
    // Create appropriate input based on element type
    let inputElement;
    let formattedContent = originalContent.replace(/<div class="edit-icon">.*?<\/div>/, '');
    
    if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3' || 
        element.tagName === 'P' || element.tagName === 'SPAN' || element.tagName === 'A') {
        // Create input for simple text elements
        inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.className = 'edit-input';
        inputElement.value = element.textContent.trim();
    } else {
        // Create textarea for complex content
        inputElement = document.createElement('textarea');
        inputElement.className = 'edit-textarea';
        
        // Remove edit icon from content
        formattedContent = formattedContent.replace(/<span class="edit-icon">.*?<\/span>/, '');
        
        // Set content to textarea
        inputElement.value = element.textContent.trim();
    }
    
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.className = 'edit-form';
    formContainer.appendChild(inputElement);
    
    // Create save icon
    const saveIcon = document.createElement('span');
    saveIcon.className = 'save-icon';
    saveIcon.innerHTML = '✓';
    saveIcon.title = 'Save changes';
    formContainer.appendChild(saveIcon);
    
    // Replace element content with form
    element.innerHTML = '';
    element.appendChild(formContainer);
    
    // Focus on input
    inputElement.focus();
    
    // Handle save action
    saveIcon.addEventListener('click', function() {
        saveChanges(element, inputElement, fieldName);
    });
    
    // Handle enter key to save
    inputElement.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            if (inputElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                saveChanges(element, inputElement, fieldName);
            }
        } else if (e.key === 'Escape') {
            // Cancel edit and restore original content
            element.innerHTML = originalContent;
        }
    });
    
    // Handle blur (clicking outside) to save
    inputElement.addEventListener('blur', function(e) {
        // Check if the related target is the save icon
        // Only save if clicking outside both input and save icon
        if (!e.relatedTarget || !e.relatedTarget.classList.contains('save-icon')) {
            // Small delay to allow clicking save icon
            setTimeout(() => {
                if (element.contains(inputElement)) {
                    saveChanges(element, inputElement, fieldName);
                }
            }, 200);
        }
    });
}

/**
 * Save changes to an editable element
 * @param {HTMLElement} element - The editable element
 * @param {HTMLElement} input - The input/textarea element
 * @param {string} fieldName - The data-field attribute value
 */
function saveChanges(element, input, fieldName) {
    let newContent = input.value;
    let originalTagName = element.tagName.toLowerCase();
    
    // Format content based on element type
    if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3' || 
        element.tagName === 'P' || element.tagName === 'SPAN' || element.tagName === 'A') {
        element.textContent = newContent;
    } else {
        // Handle complex content (like lists, etc.)
        if (element.innerHTML.includes('<ul>')) {
            // Convert text with line breaks to list items
            const lines = newContent.split('\n');
            let formattedContent = '<ul>';
            
            lines.forEach(line => {
                if (line.trim()) {
                    formattedContent += `<li>${line.trim()}</li>`;
                }
            });
            
            formattedContent += '</ul>';
            element.innerHTML = formattedContent;
        } else if (element.className.includes('skills-container')) {
            // Special handling for skills section
            processSkillsContent(element, newContent);
            
            // Add edit icon back
            addEditIcon(element);
            return; // Already handled adding edit icon
        } else {
            // Default formatting for regular text
            const lines = newContent.split('\n');
            let formattedContent = '';
            
            lines.forEach(line => {
                if (line.trim()) {
                    formattedContent += `<p>${line.trim()}</p>`;
                }
            });
            
            element.innerHTML = formattedContent;
        }
    }
    
    // Save to localStorage
    localStorage.setItem(`portfolio_${fieldName}`, element.innerHTML);
    
    // Add edit icon back
    addEditIcon(element);
}

/**
 * Process skills content
 * @param {HTMLElement} element - The skills container element
 * @param {string} content - The user input content
 */
function processSkillsContent(element, content) {
    const lines = content.split('\n');
    let currentCategory = null;
    let formattedContent = '';
    
    lines.forEach(line => {
        line = line.trim();
        
        if (!line) return;
        
        if (line.endsWith(':')) {
            // This is a category heading
            if (currentCategory) {
                formattedContent += '</div></div>';
            }
            
            const categoryName = line.slice(0, -1);
            formattedContent += `<div class="skill-category">
                <h3>${categoryName}</h3>
                <div class="skills-list">`;
            
            currentCategory = categoryName;
        } else {
            // This is a skill
            if (currentCategory) {
                formattedContent += `<span>${line}</span>`;
            } else {
                // If no category has been defined yet, create a default one
                formattedContent += `<div class="skill-category">
                    <h3>Skills</h3>
                    <div class="skills-list">
                    <span>${line}</span>`;
                currentCategory = 'Skills';
            }
        }
    });
    
    // Close the last category
    if (currentCategory) {
        formattedContent += '</div></div>';
    }
    
    element.innerHTML = formattedContent;
}

/**
 * Add edit icon back to element after editing
 * @param {HTMLElement} element - The editable element
 */
function addEditIcon(element) {
    const editIcon = document.createElement('span');
    editIcon.className = 'edit-icon';
    editIcon.innerHTML = '✏️';
    editIcon.title = 'Edit this content';
    
    element.appendChild(editIcon);
    
    // Add event listener to new edit icon
    editIcon.addEventListener('click', function() {
        enterEditMode(element);
    });
}