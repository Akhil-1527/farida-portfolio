
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
    saveBtn.textContent = '✓';

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
    });

    input.addEventListener('blur', () => {
        saveEditedContent(element, input.value, fieldName);
    });
}

// Save edited content and restore view
function saveEditedContent(element, newContent, fieldName) {
    element.innerHTML = newContent;
    localStorage.setItem(`portfolio_${fieldName}`, newContent);
}

// Setup photo edit logic
function setupPhotoEdit() {
    const overlay = document.querySelector('.edit-overlay');
    const photoModal = document.getElementById('photo-upload-modal');
    const fileInput = document.getElementById('photo-upload');
    const saveBtn = document.getElementById('save-photo');
    const cancelBtn = document.getElementById('cancel-photo');
    const closeBtns = document.querySelectorAll('.modal .close');

    overlay?.addEventListener('click', () => {
        photoModal.style.display = 'block';
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            photoModal.style.display = 'none';
        });
    });

    cancelBtn.addEventListener('click', () => {
        photoModal.style.display = 'none';
    });

    saveBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const imageData = e.target.result;
            document.getElementById('profile-photo').src = imageData;
            localStorage.setItem('portfolio_profile_photo', imageData);
            photoModal.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });
}
