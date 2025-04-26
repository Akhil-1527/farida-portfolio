/**
 * AWS DynamoDB Operations
 * - Handles database operations for the portfolio
 */
import { awsConfig } from '../config/aws-config.js';
import { showError } from '../core/utils.js';

/**
 * Load all content from DynamoDB
 * @returns {Promise<object>} - Object containing content mapped by field names
 */
export async function loadAllContent() {
    try {
        // Create DynamoDB DocumentClient
        const docClient = new AWS.DynamoDB.DocumentClient();
        
        // Query parameters - get all content
        const params = {
            TableName: awsConfig.contentTableName
        };
        
        // Execute the scan
        const result = await docClient.scan(params).promise();
        
        if (result.Items && result.Items.length > 0) {
            // Convert array to object with fieldName as key
            const contentMap = {};
            result.Items.forEach(item => {
                contentMap[item.fieldName] = item.content;
            });
            
            return contentMap;
        }
        
        return {};
    } catch (error) {
        console.error('Error loading content from DynamoDB:', error);
        showError('Failed to load content. Please try again later.');
        return {};
    }
}

/**
 * Save a single field to DynamoDB
 * @param {string} fieldName - The field name
 * @param {string} content - The content to save
 * @returns {Promise<boolean>} - Success status
 */
export async function saveFieldContent(fieldName, content) {
    try {
        // Create DynamoDB DocumentClient
        const docClient = new AWS.DynamoDB.DocumentClient();
        
        // Prepare parameters for put operation
        const params = {
            TableName: awsConfig.contentTableName,
            Item: {
                fieldName: fieldName,
                content: content,
                updatedAt: new Date().toISOString()
            }
        };
        
        // Execute the put operation
        await docClient.put(params).promise();
        return true;
    } catch (error) {
        console.error('Error saving content to DynamoDB:', error);
        showError('Failed to save content. Please try again later.');
        return false;
    }
}

/**
 * Save multiple fields to DynamoDB in batch
 * @param {object} fields - Object with fieldName: content pairs
 * @returns {Promise<boolean>} - Success status
 */
export async function saveBatchContent(fields) {
    try {
        // Create DynamoDB DocumentClient
        const docClient = new AWS.DynamoDB.DocumentClient();
        
        // AWS BatchWrite has a limit of 25 items per request
        const batchSize = 25;
        const fieldNames = Object.keys(fields);
        
        // Process in batches of 25
        for (let i = 0; i < fieldNames.length; i += batchSize) {
            const batch = fieldNames.slice(i, i + batchSize);
            
            const requestItems = {};
            requestItems[awsConfig.contentTableName] = batch.map(fieldName => ({
                PutRequest: {
                    Item: {
                        fieldName: fieldName,
                        content: fields[fieldName],
                        updatedAt: new Date().toISOString()
                    }
                }
            }));
            
            const params = {
                RequestItems: requestItems
            };
            
            await docClient.batchWrite(params).promise();
        }
        
        return true;
    } catch (error) {
        console.error('Error batch saving content to DynamoDB:', error);
        showError('Failed to save all content. Please try again later.');
        return false;
    }
}