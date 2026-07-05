import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { readFile } from 'fs/promises';
import path from 'path';

let initialized = false;

export const initFirebase = async () => {
  if (initialized) return;
  try {
    let serviceAccount;
    
    // Try to load from Environment Variable first (for Render deployment)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
      // Fallback to local file
      const serviceAccountPath = path.resolve('./config/firebase-service-account.json');
      serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'));
    }
    
    initializeApp({
      credential: cert(serviceAccount)
    });
    initialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
};

export const sendPushNotification = async (tokens, title, body, imageUrl = '', link = '') => {
  if (!initialized || !tokens || tokens.length === 0) return { success: false, message: 'No tokens provided' };

  try {
    const message = {
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl })
      },
      data: {
        click_action: link || 'https://nexoria.com' // Fallback
      },
      tokens
    };

    const response = await getMessaging().sendEachForMulticast(message);
    
    // Check for failed tokens and maybe clean them up from DB later
    const failedTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
      }
    });

    return { success: true, successCount: response.successCount, failureCount: response.failureCount, failedTokens };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};
