/**
 * AWS Cognito Authentication
 * - Handles user authentication with Cognito
 */
import { awsConfig, adminEmails } from '../config/aws-config.js';
import { showError } from '../core/utils.js';

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} - Auth result or error
 */
export async function loginWithEmailPassword(email, password) {
    try {
        // Check if email is an admin
        if (!adminEmails.includes(email)) {
            return { 
                success: false, 
                error: 'This email is not authorized for admin access.' 
            };
        }
        
        // Initialize user pool
        const userPool = new AmazonCognitoIdentity.CognitoUserPool({
            UserPoolId: awsConfig.userPoolId,
            ClientId: awsConfig.clientId
        });
        
        // Set up cognito user
        const userData = {
            Username: email,
            Pool: userPool
        };
        
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        
        // Set up auth details
        const authData = {
            Username: email,
            Password: password
        };
        
        const authDetails = new AmazonCognitoIdentity.AuthenticationDetails(authData);
        
        // Authenticate user
        return new Promise((resolve, reject) => {
            cognitoUser.authenticateUser(authDetails, {
                onSuccess: function(result) {
                    console.log('Authentication successful');
                    
                    // Get tokens
                    const idToken = result.getIdToken().getJwtToken();
                    const accessToken = result.getAccessToken().getJwtToken();
                    
                    // Set up credentials
                    const loginKey = `cognito-idp.${awsConfig.region}.amazonaws.com/${awsConfig.userPoolId}`;
                    
                    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                        IdentityPoolId: awsConfig.identityPoolId,
                        Logins: {
                            [loginKey]: idToken
                        }
                    });
                    
                    // Refresh credentials
                    AWS.config.credentials.refresh((error) => {
                        if (error) {
                            reject({
                                success: false,
                                error: 'Failed to authenticate. Please try again.'
                            });
                        } else {
                            resolve({
                                success: true,
                                user: {
                                    email: email,
                                    idToken: idToken,
                                    accessToken: accessToken
                                }
                            });
                        }
                    });
                },
                onFailure: function(err) {
                    console.error('Authentication error:', err);
                    
                    reject({
                        success: false,
                        error: err.message || 'Invalid credentials. Please try again.'
                    });
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: 'An error occurred during login. Please try again.'
        };
    }
}

/**
 * Check if user is authenticated
 * @returns {Promise<object>} - Auth status and user info
 */
export async function checkAuthentication() {
    try {
        // Get user pool
        const userPool = new AmazonCognitoIdentity.CognitoUserPool({
            UserPoolId: awsConfig.userPoolId,
            ClientId: awsConfig.clientId
        });
        
        // Get current user
        const cognitoUser = userPool.getCurrentUser();
        
        if (!cognitoUser) {
            return { authenticated: false };
        }
        
        return new Promise((resolve) => {
            cognitoUser.getSession((err, session) => {
                if (err || !session || !session.isValid()) {
                    resolve({ authenticated: false });
                    return;
                }
                
                // Get user attributes
                cognitoUser.getUserAttributes((attrErr, attributes) => {
                    if (attrErr) {
                        resolve({
                            authenticated: true,
                            user: { email: cognitoUser.username }
                        });
                        return;
                    }
                    
                    // Find email attribute
                    const emailAttr = attributes.find(attr => attr.Name === 'email');
                    const email = emailAttr ? emailAttr.Value : cognitoUser.username;
                    
                    // Check if email is in admin list
                    if (!adminEmails.includes(email)) {
                        resolve({ authenticated: false });
                        return;
                    }
                    
                    // Set up credentials
                    const loginKey = `cognito-idp.${awsConfig.region}.amazonaws.com/${awsConfig.userPoolId}`;
                    
                    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                        IdentityPoolId: awsConfig.identityPoolId,
                        Logins: {
                            [loginKey]: session.getIdToken().getJwtToken()
                        }
                    });
                    
                    // Refresh credentials
                    AWS.config.credentials.refresh((refreshErr) => {
                        if (refreshErr) {
                            resolve({ authenticated: false });
                        } else {
                            resolve({
                                authenticated: true,
                                user: { email: email }
                            });
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error('Authentication check error:', error);
        return { authenticated: false };
    }
}

/**
 * Logout the current user
 * @returns {Promise<boolean>} - Success status
 */
export async function logout() {
    try {
        // Get user pool
        const userPool = new AmazonCognitoIdentity.CognitoUserPool({
            UserPoolId: awsConfig.userPoolId,
            ClientId: awsConfig.clientId
        });
        
        // Get current user
        const cognitoUser = userPool.getCurrentUser();
        
        if (cognitoUser) {
            cognitoUser.signOut();
            
            // Clear credentials
            AWS.config.credentials.clearCachedId();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Logout error:', error);
        showError('Failed to logout. Please try again.');
        return false;
    }
}