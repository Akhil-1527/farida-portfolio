/**
 * admin.js - Admin functionality for Mohammad Abdul Faridajalal's portfolio
 * Only loaded when ?admin=true is in the URL
 * Handles inline editing, profile photo upload, and JSON export
 */

// Initialize admin mode when function is called from main.js
function initializeAdmin() {
    console.log('Admin mode initialized');
    
    // Show admin tools bar
    document.getElementById('adminTools').classList.remove('hidden');
    
    // Initialize editable elements
    initEditableElements();
    
    // Initialize profile photo upload
    initProfileUpload();
    
    // Initialize export data functionality
    initExportData();
    
    // Apply fade-in animation to admin elements
    fadeInAdminElements();
  }
  
  /**
   * Initialize all editable elements with edit icons and click handlers
   */
  function initEditableElements() {
    const editableElements = document.querySelectorAll('.editable');
    
    editableElements.forEach(element => {
      // Create edit icon
      const editIcon = document.createElement('span');
      editIcon.className = 'edit-icon';
      editIcon.innerHTML = '<i class="fas fa-pencil-alt"></i>';
      
      // Add edit icon to element
      element.appendChild(editIcon);
      
      // Load saved content from localStorage if available
      const fieldName = element.getAttribute('data-field');
      const savedContent = getSavedContent(fieldName);
      
      if (savedContent) {
        if (element.tagName.toLowerCase() === 'img') {
          element.src = savedContent;
        } else {
          element.textContent = savedContent;
        }
      }
      
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
   * Make an element editable
   */
  function makeElementEditable(element) {
    // Mark element as active
    element.classList.add('active');
    
    // Get current content
    const currentContent = element.textContent;
    const fieldName = element.getAttribute('data-field');
    
    // Create input based on element type
    let inputElement;
    
    if (element.tagName.toLowerCase() === 'p' && element.textContent.length > 80) {
      // For longer text, use textarea
      inputElement = document.createElement('textarea');
      inputElement.rows = 4;
      inputElement.style.width = '100%';
      inputElement.style.padding = '8px';
      inputElement.style.boxSizing = 'border-box';
      inputElement.value = currentContent;
    } else {
      // For shorter text, use input
      inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.style.width = '100%';
      inputElement.style.padding = '8px';
      inputElement.style.boxSizing = 'border-box';
      inputElement.value = currentContent;
    }
    
    // Clear element content and add input
    element.textContent = '';
    element.appendChild(inputElement);
    
    // Focus the input
    inputElement.focus();
    
    // Handle save on blur or Enter key
    inputElement.addEventListener('blur', () => saveEdit(element, inputElement, fieldName));
    inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName.toLowerCase() !== 'textarea') {
        e.preventDefault();
        saveEdit(element, inputElement, fieldName);
      }
      if (e.key === 'Escape') {
        cancelEdit(element, currentContent);
      }
    });
  }
  
  /**
   * Save edits to an element
   */
  function saveEdit(element, inputElement, fieldName) {
    const newContent = inputElement.value;
    
    // Remove the input
    element.removeChild(inputElement);
    
    // Update the element content
    element.textContent = newContent;
    
    // Re-append the edit icon
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
    
    // Update logo image if editing logo text
    if (fieldName === 'logoText') {
      updatePageTitle(newContent);
    }
  }
  
  /**
   * Cancel edit and restore original content
   */
  function cancelEdit(element, originalContent) {
    // Remove any inputs
    const input = element.querySelector('input, textarea');
    if (input) {
      element.removeChild(input);
    }
    
    // Restore original content
    element.textContent = originalContent;
    
    // Re-append the edit icon
    const editIcon = document.createElement('span');
    editIcon.className = 'edit-icon';
    editIcon.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    element.appendChild(editIcon);
    
    // Add click handler for editing
    editIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      makeElementEditable(element);
    });
    
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
      profileImage.src = savedProfileImage;
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
  
  /**
   * Initialize export data functionality
   */
  function initExportData() {
    const exportButton = document.getElementById('exportDataBtn');
    
    exportButton.addEventListener('click', () => {
      const exportData = collectAllData();
      downloadJSON(exportData, 'portfolio_data.json');
    });
  }
  
  /**
   * Collect all editable data
   */
  function collectAllData() {
    const data = {};
    
    // Collect field data
    document.querySelectorAll('.editable').forEach(element => {
      const fieldName = element.getAttribute('data-field');
      if (fieldName) {
        if (element.tagName.toLowerCase() === 'img') {
          data[fieldName] = element.src;
        } else {
          data[fieldName] = element.textContent;
        }
      }
    });
    
    // Add profile image
    const profileImage = getSavedContent('profileImage');
    if (profileImage) {
      data.profileImage = profileImage;
    }
    
    // Add metrics data
    try {
      const metricsData = localStorage.getItem('metricsData');
      if (metricsData) {
        data.metricsData = JSON.parse(metricsData);
      }
    } catch (error) {
      console.error('Error collecting metrics data:', error);
    }
    
    return data;
  }
  
  /**
   * Download data as JSON file
   */
  function downloadJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  /**
   * Save content to localStorage
   */
  function saveContent(key, value) {
    try {
      localStorage.setItem(`portfolio_${key}`, value);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      
      // If the error is due to localStorage size limits (for large images)
      if (error.name === 'QuotaExceededError') {
        alert('Warning: The image may be too large to save in localStorage. Your changes might not persist after refreshing the page.');
      }
    }
  }
  
  /**
   * Get saved content from localStorage
   */
  function getSavedContent(key) {
    try {
      return localStorage.getItem(`portfolio_${key}`);
    } catch (error) {
      console.error('Error retrieving from localStorage:', error);
      return null;
    }
  }
  
  /**
   * Apply fade-in animation to admin elements
   */
  function fadeInAdminElements() {
    const editIcons = document.querySelectorAll('.edit-icon');
    
    editIcons.forEach((icon, index) => {
      icon.style.transition = 'opacity 0.3s ease';
      icon.style.opacity = '0';
      
      setTimeout(() => {
        icon.style.opacity = '1';
      }, 100 + (index * 50));
    });
  }