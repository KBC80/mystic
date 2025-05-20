// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqL1wBlez0mq_zMddSFOSYf0T-Nf2tdG4",
  authDomain: "mystic-guide-hecgb.firebaseapp.com",
  projectId: "mystic-guide-hecgb",
  storageBucket: "mystic-guide-hecgb.firebasestorage.app",
  messagingSenderId: "361959235440",
  appId: "1:361959235440:web:0151c3248206faa41739b5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the app instance for use in other files
export default app;