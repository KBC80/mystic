// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqL1wBlez0mq_zMddSFOSYf0T-Nf2tdG4",
  authDomain: "mystic-guide-hecgb.firebaseapp.com",
  projectId: "mystic-guide-hecgb",
  storageBucket: "mystic-guide-hecgb.firebasestorage.app",
  messagingSenderId: "361959235440",
  appId: "1:361959235440:web:0151c3248206faa41739b5",
  measurementId: "G-DJZEKXLVZ9"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // 이미 초기화된 앱이 있다면 해당 인스턴스를 사용
}

let analytics;
// 클라이언트 사이드에서만, 그리고 Analytics가 지원되는 경우에만 초기화
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Export the app instance for use in other files
export default app;
// 필요에 따라 analytics도 export 할 수 있습니다.
export { analytics };
