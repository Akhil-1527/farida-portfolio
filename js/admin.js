// admin.js - Admin mode functionality for Mohammad Abdul Faridajalal's portfolio website

// Initialize admin functionality
function initializeAdmin() {
    console.log('Admin mode activated');
    
    // Show admin badge
    document.querySelector('.admin-badge').style.display = 'block';
    
    // Show edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.style.display = 'inline-block';
    });
    
    // Setup edit button click handlers
    setupEditHandlers();
    
    // Create export JSON button
    createExportButton();
    
    // Setup metrics data editing
    setupMetricsDataEditing();
    
    // Load content from localStorage
    loadContentFromLocalStorage();
}

// Setup edit button handlers
function setupEditHandlers() {
    // Handle edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Handle container elements (like timelines, skills grid, etc.)
                    handleContainerEdit(targetElement, targetId);
                } else {
                    // Handle direct editable elements
                    const editableElements = document.querySelectorAll(`[data-field="${targetId}"]`);
                    editableElements.forEach(el => handleElementEdit(el));
                }
            }
        });
    });
    
    // Also handle direct editable elements clicking
    document.querySelectorAll('.editable').forEach(el => {
        el.addEventListener('click', function(e) {
            // Make sure we're in admin mode
            const urlParams = new URLSearchParams(window.location.search);
            const isAdmin = urlParams.get('admin') === 'true';
            
            if (isAdmin) {
                handleElementEdit(this);
                e.stopPropagation(); // Prevent triggering parent click events (like modal open)
            }
        });
    });
}

// Handle editing of container elements
function handleContainerEdit(container, containerId) {
    // Get all editable elements within the container
    const editableElements = container.querySelectorAll('.editable');
    
    if (editableElements.length > 0) {
        // Create a modal for editing multiple elements
        createEditModal(editableElements, containerId);
    }
}

// Handle editing of individual elements
function handleElementEdit(element) {
    const currentContent = element.innerHTML;
    const fieldName = element.getAttribute('data-field');
    
    // Handle special cases first
    if (fieldName === 'phone' || fieldName === 'email' || fieldName === 'deployment-frequency' || 
        fieldName === 'mttr' || fieldName === 'failure-rate') {
        createSimpleInPlaceEditor(element, currentContent, fieldName);
        return;
    }
    
    // Create a standard in-place editor for other elements
    createInPlaceEditor(element, currentContent, fieldName);
}

// Create simple in-place editor for basic text elements
function createSimpleInPlaceEditor(element, content, fieldName) {
    // Store original content for cancel operation
    const originalContent = content;
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
    
    // Add editor styles
    addEditorStyles();
    
    // Setup save and cancel buttons
    const saveBtn = element.querySelector('.editor-save');
    const cancelBtn = element.querySelector('.editor-cancel');
    
    saveBtn.addEventListener('click', function() {
        const newContent = element.querySelector('.editor-input').value;
        
        // Special handling for metrics data
        if (fieldName === 'deployment-frequency' || fieldName === 'mttr' || fieldName === 'failure-rate') {
            saveMetricValue(fieldName, newContent);
        } else {
            // Save to localStorage
            saveContentToLocalStorage(fieldName, newContent);
        }
        
        // Update element
        element.innerHTML = newContent;
    });
    
    cancelBtn.addEventListener('click', function() {
        // Restore original content
        element.innerHTML = originalContent;
    });
    
    // Focus on the input
    const input = element.querySelector('.editor-input');
    if (input) {
        input.focus();
    }
}

// Create in-place editor for complex elements
function createInPlaceEditor(element, content, fieldName) {
    // Store original content for cancel operation
    const originalContent = content;
    
    // Determine editor type based on content
    let editorHTML;
    
    if (content.includes('<h3>') || content.includes('<ul>') || content.includes('<div class="date">')) {
        // Complex HTML content - use textarea
        editorHTML = `
            <div class="editor-container">
                <textarea class="editor-textarea">${content}</textarea>
                <div class="editor-controls">
                    <button class="editor-save">Save</button>
                    <button class="editor-cancel">Cancel</button>
                </div>
            </div>
        `;
    } else {
        // Simple text content - use input
        const textContent = element.textContent.trim();
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
    
    // Add editor styles
    addEditorStyles();
    
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
        
        // Save to localStorage
        saveContentToLocalStorage(fieldName, newContent);
        
        // Update element
        element.innerHTML = newContent;
    });
    
    cancelBtn.addEventListener('click', function() {
        // Restore original content
        element.innerHTML = originalContent;
    });
    
    // Focus on the input/textarea
    const input = element.querySelector('.editor-textarea') || element.querySelector('.editor-input');
    if (input) {
        input.focus();
    }
}

// Add editor styles
function addEditorStyles() {
    if (!document.getElementById('editor-styles')) {
        const editorStyles = document.createElement('style');
        editorStyles.id = 'editor-styles';
        editorStyles.textContent = `
            .editor-container {
                margin: 10px 0;
            }
            .editor-textarea, .editor-input {
                width: 100%;
                padding: 10px;
                border: 2px solid var(--primary-color);
                border-radius: 4px;
                background-color: var(--bg-color);
                color: var(--text-color);
                margin-bottom: 10px;
            }
            .editor-textarea {
                min-height: 150px;
            }
            .editor-controls {
                display: flex;
                gap: 10px;
            }
            .editor-save, .editor-cancel {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
            }
            .editor-save {
                background-color: var(--primary-color);
                color: white;
            }
            .editor-cancel {
                background-color: #f44336;
                color: white;
            }
        `;
        
        document.head.appendChild(editorStyles);
    }
}

// Create modal for editing container elements
function createEditModal(elements, containerId) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    
    let modalContent = `
        <div class="edit-modal-content">
            <span class="edit-modal-close">&times;</span>
            <h2>Edit ${containerId}</h2>
            <div class="edit-modal-form">
    `;
    
    // Add form fields for each editable element
    elements.forEach((el, index) => {
        const fieldName = el.getAttribute('data-field');
        const content = el.innerHTML;
        
        modalContent += `
            <div class="edit-modal-field">
                <h3>${fieldName}</h3>
                <textarea data-field="${fieldName}" rows="6">${content}</textarea>
            </div>
        `;
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
    
    // Add modal styles
    addModalStyles();
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Setup event handlers
    modal.querySelector('.edit-modal-close').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.edit-modal-cancel').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.edit-modal-save').addEventListener('click', function() {
        // Save all fields
        const fields = modal.querySelectorAll('textarea');
        
        fields.forEach(field => {
            const fieldName = field.getAttribute('data-field');
            const newContent = field.value;
            
            // Save to localStorage
            saveContentToLocalStorage(fieldName, newContent);
            
            // Update element on page
            const pageElement = document.querySelector(`[data-field="${fieldName}"]`);
            if (pageElement) {
                pageElement.innerHTML = newContent;
            }
        });
        
        // Close modal
        document.body.removeChild(modal);
    });
}

// Add modal styles
function addModalStyles() {
    if (!document.getElementById('modal-styles')) {
        const modalStyles = document.createElement('style');
        modalStyles.id = 'modal-styles';
        modalStyles.textContent = `
            .edit-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1002;
            }
            .edit-modal-content {
                background-color: var(--bg-color);
                border-radius: 6px;
                width: 80%;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                padding: 30px;
                position: relative;
            }
            .edit-modal-close {
                position: absolute;
                top: 10px;
                right: 20px;
                font-size: 28px;
                cursor: pointer;
                color: var(--text-color);
            }
            .edit-modal-form {
                margin-top: 20px;
            }
            .edit-modal-field {
                margin-bottom: 20px;
            }
            .edit-modal-field h3 {
                margin-bottom: 10px;
                color: var(--primary-color);
            }
            .edit-modal-field textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                background-color: var(--bg-color);
                color: var(--text-color);
            }
            .edit-modal-controls {
                display: flex;
                justify-content: flex-end;
                gap: 15px;
                margin-top: 20px;
            }
            .edit-modal-save, .edit-modal-cancel {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
            }
            .edit-modal-save {
                background-color: var(--primary-color);
                color: white;
            }
            .edit-modal-cancel {
                background-color: #f44336;
                color: white;
            }
        `;
        
        document.head.appendChild(modalStyles);
    }
}

// Save content to localStorage
function saveContentToLocalStorage(fieldName, content) {
    // Get existing data or initialize new object
    let portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || {};
    
    // Update field
    portfolioData[fieldName] = content;
    
    // Save back to localStorage
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    
    console.log(`Saved content for ${fieldName}`);
}

// Save metric value and update charts if needed
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

// Load content from localStorage
function loadContentFromLocalStorage() {
    const portfolioData = JSON.parse(localStorage.getItem('portfolioData'));
    
    if (!portfolioData) return;
    
    // Update all editable elements with stored content
    Object.keys(portfolioData).forEach(fieldName => {
        const element = document.querySelector(`[data-field="${fieldName}"]`);
        
        if (element) {
            element.innerHTML = portfolioData[fieldName];
        }
    });
}

// Create export JSON button
function createExportButton() {
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Data (JSON)';
    exportBtn.className = 'export-btn';
    exportBtn.title = "Download current edits as JSON backup";
    
    const exportBtnStyle = document.createElement('style');
    exportBtnStyle.textContent = `
        .export-btn {
            position: fixed;
            bottom: 30px;
            left: 30px;
            padding: 12px 24px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            z-index: 999;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        .export-btn:hover {
            background-color: var(--secondary-color);
        }
    `;
    
    document.head.appendChild(exportBtnStyle);
    document.body.appendChild(exportBtn);
    
    exportBtn.addEventListener('click', function() {
        // Get data from localStorage
        const portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || {};
        const metricsData = JSON.parse(localStorage.getItem('metricsData')) || {};
        
        // Combine all data
        const exportData = {
            portfolioContent: portfolioData,
            metricsData: metricsData
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

// Setup metrics data editing
function setupMetricsDataEditing() {
    const dashboardContainer = document.getElementById('dashboard-container');
    
    if (dashboardContainer) {
        const editBtn = document.querySelector('[data-target="dashboard-container"]');
        
        editBtn.addEventListener('click', function() {
            // Create metrics data editor modal
            createMetricsDataEditor();
        });
    }
}

// Create metrics data editor
function createMetricsDataEditor() {
    // Get current metrics data
    const metricsData = JSON.parse(localStorage.getItem('metricsData')) || {};
    
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    
    let modalContent = `
        <div class="edit-modal-content">
            <span class="edit-modal-close">&times;</span>
            <h2>Edit DevOps Metrics Data</h2>
            <div class="edit-modal-form">
                <div class="chart-data-editor">
                    <h3>Deployment Frequency</h3>
                    <div class="metric-edit">
                        <label>Current Value: </label>
                        <input type="text" id="deployment-frequency-value" value="${metricsData.deploymentFrequency || '5'}">
                        <span class="unit">deployments/week</span>
                    </div>
                    <div class="chart-data-fields">
                        <div class="chart-labels">
                            <h4>Time Periods (x-axis)</h4>
                            <textarea id="deployment-labels" rows="2">${metricsData.deployment?.labels.join(', ') || ''}</textarea>
                        </div>
                        <div class="chart-values">
                            <h4>Values (y-axis)</h4>
                            <textarea id="deployment-data" rows="2">${metricsData.deployment?.data.join(', ') || ''}</textarea>
                        </div>
                    </div>
                </div>
                
                <div class="chart-data-editor">
                    <h3>Mean Time to Recovery</h3>
                    <div class="metric-edit">
                        <label>Current Value: </label>
                        <input type="text" id="mttr-value" value="${metricsData.mttr || '90'}">
                        <span class="unit">minutes</span>
                    </div>
                    <div class="chart-data-fields">
                        <div class="chart-labels">
                            <h4>Time Periods (x-axis)</h4>
                            <textarea id="recovery-labels" rows="2">${metricsData.recovery?.labels.join(', ') || ''}</textarea>
                        </div>
                        <div class="chart-values">
                            <h4>Values (y-axis)</h4>
                            <textarea id="recovery-data" rows="2">${metricsData.recovery?.data.join(', ') || ''}</textarea>
                        </div>
                    </div>
                </div>
                
                <div class="chart-data-editor">
                    <h3>Change Failure Rate</h3>
                    <div class="metric-edit">
                        <label>Current Value: </label>
                        <input type="text" id="failure-rate-value" value="${metricsData.failureRate || '4.3%'}">
                    </div>
                    <div class="chart-data-fields">
                        <div class="chart-labels">
                            <h4>Time Periods (x-axis)</h4>
                            <textarea id="failure-labels" rows="2">${metricsData.failure?.labels.join(', ') || ''}</textarea>
                        </div>
                        <div class="chart-values">
                            <h4>Values (y-axis)</h4>
                            <textarea id="failure-data" rows="2">${metricsData.failure?.data.join(', ') || ''}</textarea>
                        </div>
                    </div>
                </div>
            </div>
            <div class="edit-modal-controls">
                <button class="edit-modal-save">Save Metrics</button>
                <button class="edit-modal-cancel">Cancel</button>
            </div>
        </div>
    `;
    
    modal.innerHTML = modalContent;
    
    // Add modal styles
    addModalStyles();
    
    // Add special chart editor styles
    const chartEditorStyles = document.createElement('style');
    chartEditorStyles.textContent = `
        .chart-data-editor {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
        }
        .chart-data-editor h3 {
            margin-bottom: 15px;
            color: var(--primary-color);
        }
        .metric-edit {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .metric-edit label {
            margin-right: 10px;
            font-weight: 500;
        }
        .metric-edit input {
            width: 100px;
            padding: 8px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            margin-right: 10px;
        }
        .metric-edit .unit {
            color: var(--gray-dark);
        }
        .chart-data-fields {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .chart-labels, .chart-values {
            flex: 1;
        }
        .chart-data-fields h4 {
            margin-bottom: 10px;
        }
        .chart-data-fields textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            background-color: var(--bg-color);
            color: var(--text-color);
        }
    `;
    
    document.head.appendChild(chartEditorStyles);
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Setup event handlers
    modal.querySelector('.edit-modal-close').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.edit-modal-cancel').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.edit-modal-save').addEventListener('click', function() {
        // Parse and validate all chart data
        try {
            const newMetricsData = {
                deploymentFrequency: document.getElementById('deployment-frequency-value').value,
                mttr: document.getElementById('mttr-value').value,
                failureRate: document.getElementById('failure-rate-value').value,
                deployment: {
                    labels: parseTextareaToArray(document.getElementById('deployment-labels').value),
                    data: parseTextareaToArray(document.getElementById('deployment-data').value, true)
                },
                recovery: {
                    labels: parseTextareaToArray(document.getElementById('recovery-labels').value),
                    data: parseTextareaToArray(document.getElementById('recovery-data').value, true)
                },
                failure: {
                    labels: parseTextareaToArray(document.getElementById('failure-labels').value),
                    data: parseTextareaToArray(document.getElementById('failure-data').value, true),
                    current: parseFloat(document.getElementById('failure-rate-value').value.replace('%', ''))
                }
            };
            
            // Save to localStorage
            localStorage.setItem('metricsData', JSON.stringify(newMetricsData));
            
            // Refresh charts
            if (typeof initializeDoraMetrics === 'function') {
                initializeDoraMetrics();
            }
            
            // Close modal
            document.body.removeChild(modal);
            
            alert('Metrics data updated successfully!');
        } catch (error) {
            alert('Error saving metrics data: ' + error.message);
        }
    });
}

// Parse textarea content to array
function parseTextareaToArray(text, asNumbers = false) {
    // Split by comma and trim each value
    const array = text.split(',').map(item => item.trim());
    
    if (asNumbers) {
        // Convert to numbers and validate
        return array.map(item => {
            const num = parseFloat(item);
            if (isNaN(num)) {
                throw new Error(`"${item}" is not a valid number`);
            }
            return num;
        });
    }
    
    return array;
}