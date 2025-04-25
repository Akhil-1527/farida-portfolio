/**
 * admin.js - Admin functionality for Mohammad Abdul Faridajalal's portfolio
 * Only loaded when ?admin=true is in the URL
 * Handles inline editing, profile photo upload, and JSON export
 */

// Initialize admin mode when function is called from main.js
function initializeAdmin() {
    console.log('Admin mode initialized');
    
    // Show admin tools bar with animation
    const adminTools = document.getElementById('adminTools');
    adminTools.classList.remove('hidden');
    
    // Initialize editable elements
    initEditableElements();
    
    // Initialize profile photo upload
    initProfileUpload();
    
    // Initialize export data functionality
    initExportData();
  }
  
  /**
   * Initialize all editable elements with edit icons and data loading
   */
  function initEditableElements() {
    const editableElements = document.querySelectorAll('.editable');
    
    editableElements.forEach((element, index) => {
      // First load saved content if available
      const fieldName = element.getAttribute('data-field');
      if (fieldName) {
        const savedContent = getSavedContent(fieldName);
        
        if (savedContent) {
          if (element.tagName.toLowerCase() === 'img') {
            element.src = savedContent;
          } else {
            element.textContent = savedContent;
          }
        }
      }
      
      // Create edit icon with animation
      const editIcon = document.createElement('span');
      editIcon.className = 'edit-icon';
      editIcon.innerHTML = '<i class="fas fa-pencil-alt"></i>';
      
      // Add staggered animation delay
      setTimeout(() => {
        editIcon.classList.add('edit-icon-animation');
      }, 100 + (index * 50)); // Staggered animation
      
      // Add edit icon to element
      element.appendChild(editIcon);
      
      // Add click handler for editing
      editIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        makeElementEditable(element);
      });
      
      // Alternative: double-click on element to edit
      element.addEventListener('dblclick', () => {
        makeElementEditable(element);
      });
    });
  }
  
  /**
   * Make an element editable with proper inline editor
   */
  function makeElementEditable(element) {
    // Prevent editing if already active
    if (element.classList.contains('active')) return;
    
    // Mark element as active
    element.classList.add('active');
    
    // Get current content and field name
    const currentContent = element.textContent;
    const fieldName = element.getAttribute('data-field');
    
    // Create inline editor container
    const editorContainer = document.createElement('div');
    editorContainer.className = 'inline-editor';
    
    // Create input based on element type
    let inputElement;
    
    if (element.tagName.toLowerCase() === 'p' || currentContent.length > 60) {
      // For longer text, use textarea
      inputElement = document.createElement('textarea');
      inputElement.rows = 4;
      inputElement.value = currentContent;
    } else {
      // For shorter text, use input
      inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.value = currentContent;
    }
    
    // Create action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'editor-actions';
    
    const saveButton = document.createElement('button');
    saveButton.className = 'editor-btn save-btn';
    saveButton.textContent = 'Save';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'editor-btn cancel-btn';
    cancelButton.textContent = 'Cancel';
    
    // Add elements to container
    editorContainer.appendChild(inputElement);
    actionsDiv.appendChild(saveButton);
    actionsDiv.appendChild(cancelButton);
    editorContainer.appendChild(actionsDiv);
    
    // Clear element content and add inline editor
    const originalContent = element.innerHTML;
    element.innerHTML = '';
    element.appendChild(editorContainer);
    
    // Focus the input
    inputElement.focus();
    
    // Handle save button click
    saveButton.addEventListener('click', () => {
      saveEdit(element, inputElement.value, fieldName, originalContent);
    });
    
    // Handle cancel button click
    cancelButton.addEventListener('click', () => {
      cancelEdit(element, originalContent);
    });
    
    // Handle Enter key for inputs (not for textarea)
    inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && inputElement.tagName.toLowerCase() !== 'textarea') {
        e.preventDefault();
        saveEdit(element, inputElement.value, fieldName, originalContent);
      }
      if (e.key === 'Escape') {
        cancelEdit(element, originalContent);
      }
    });
  }
  
  /**
   * Save edits to an element and update storage
   */
  function saveEdit(element, newContent, fieldName, originalHtml) {
    // Remove the inline editor
    element.innerHTML = '';
    
    // Update the element content
    element.textContent = newContent;
    
    // Re-create and add the edit icon
    const editIcon = document.createElement('span');
    editIcon.className = 'edit-icon';
    editIcon.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    element.appendChild(editIcon);
    
    // Add click handler for editing
    editIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      makeElementEditable(element);
    });
    
    // Save to localStorage
    saveContent(fieldName, newContent);
    
    // Remove active class
    element.classList.remove('active');
    
    // Update logo text in page title if needed
    if (fieldName === 'logoText') {
      updatePageTitle(newContent);
    }
  }
  
  /**
   * Cancel edit and restore original content
   */
  function cancelEdit(element, originalHtml) {
    // Restore original content with edit icon
    element.innerHTML = originalHtml;
    
    // Reattach edit icon event listener
    const editIcon = element.querySelector('.edit-icon');
    if (editIcon) {
      editIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        makeElementEditable(element);
      });
    }
    
    // Remove active class
    element.classList.remove('active');
  }
  
  /**
   * Update page title if logo text changes
   */
  function updatePageTitle(newTitle) {
    if (newTitle) {
      document.title = newTitle + ' - Azure DevOps | SRE';
    }
  }
  
  /**
   * Initialize profile photo upload functionality
   */
  function initProfileUpload() {
    const profileUploadDiv = document.getElementById('profileUpload');
    const imageUploadInput = document.getElementById('imageUpload');
    const profileImage = document.getElementById('profileImage');
    const logoImg = document.getElementById('logoImg');
    
    // Show the upload button
    profileUploadDiv.classList.remove('hidden');
    
    // Load saved profile image if available
    const savedProfileImage = getSavedContent('profileImage');
    if (savedProfileImage) {
      if (profileImage) profileImage.src = savedProfileImage;
      if (logoImg) logoImg.src = savedProfileImage;
    }
    
    // Handle file input change
    imageUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
          const imageData = event.target.result;
          
          // Update main profile image
          profileImage.src = imageData;
          
          // Update logo image if it exists
          if (logoImg) logoImg.src = imageData;
          
          // Save to localStorage
          saveContent('profileImage', imageData);
        };
        
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid image file.');
      }
    });
  }