/**
 * AWS S3 Storage Operations
 * - Handles file operations for the portfolio
 */
import { awsConfig } from '../config/aws-config.js';
import { showError, showSuccess } from '../core/utils.js';
import { saveFieldContent } from './aws-database.js';

/**
 * Upload profile photo to S3
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The URL of the uploaded file
 */
export async function uploadProfilePhoto(file) {
    try {
        // Get file type and validate
        const fileType = file.type;
        if (!fileType.match(/^image\//)) {
            throw new Error('Please select an image file');
        }
        
        // Create S3 service object
        const s3 = new AWS.S3({
            params: { Bucket: awsConfig.bucketName }
        });
        
        // Set up the file parameters
        const photoKey = `profile/profile.jpg`;
        
        // Upload file to S3
        await s3.upload({
            Key: photoKey,
            Body: file,
            ContentType: fileType
        }).promise();
        
        // Save photo key to DynamoDB
        await saveFieldContent('profilePhotoKey', photoKey);
        
        // Return signed URL
        return getProfilePhotoUrl();
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        showError('Failed to upload profile photo: ' + error.message);
        throw error;
    }
}

/**
 * Get the profile photo URL from S3
 * @returns {Promise<string>} - The URL of the profile photo
 */
export async function getProfilePhotoUrl() {
    try {
        // Create S3 service object
        const s3 = new AWS.S3({
            params: { Bucket: awsConfig.bucketName }
        });
        
        // Get photoKey from DynamoDB
        const docClient = new AWS.DynamoDB.DocumentClient();
        
        const params = {
            TableName: awsConfig.contentTableName,
            Key: {
                fieldName: 'profilePhotoKey'
            }
        };
        
        const result = await docClient.get(params).promise();
        const photoKey = result.Item ? result.Item.content : 'profile/profile.jpg';
        
        // Generate a signed URL
        const signedUrl = s3.getSignedUrl('getObject', {
            Key: photoKey,
            Expires: 60 * 60 // URL expires in 1 hour
        });
        
        return signedUrl;
    } catch (error) {
        console.error('Error getting profile photo URL:', error);
        return 'assets/images/default-profile.jpg';
    }
}