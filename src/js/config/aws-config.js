/**
 * AWS Configuration
 * - Contains AWS credentials and configuration for the Portfolio application
 * - IMPORTANT: Replace with your own AWS Free Tier values
 */

const awsConfig = {
    // AWS Region
    region: 'us-east-1',
    
    // Amazon Cognito Identity Pool ID
    identityPoolId: 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    
    // Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_xxxxxxxxx',
    
    // Amazon Cognito App Client ID
    clientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
    
    // Amazon S3 Bucket Name
    bucketName: 'farida-portfolio',
    
    // Amazon DynamoDB Table Name
    contentTableName: 'PortfolioContent'
};

// Admin emails for authentication
const adminEmails = [
    'mdfaridajalal@gmail.com',
    'akhilc1227@gmail.com'
];

// Export configuration
export { awsConfig, adminEmails };