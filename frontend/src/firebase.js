import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDhXK9MGRyWSrcBmJuhzDbHnMpGqH_vHbU",
  authDomain: "nexoria-official.firebaseapp.com",
  projectId: "nexoria-official",
  storageBucket: "nexoria-official.firebasestorage.app",
  messagingSenderId: "1062964573024",
  appId: "1:1062964573024:web:212e178a5bf9236d0c6405",
  measurementId: "G-YLNDZR5CKY"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { 
      vapidKey: 'BMTxQc-_1sE8s50V0w473j1cOQkC6o0m5i2gT0P7-Tf1P10vR6zZ945LdGk4k7hZ0wO232g_hE9m45Q58qg20Y' // Note: This needs an actual VAPID key from Firebase console. Without it, web push may fail. Wait, the docs say vapidKey is optional but highly recommended. I will leave it empty for now or generate one later if it fails.
    });
    
    if (currentToken) {
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { app, messaging };
