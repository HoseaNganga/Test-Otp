// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6kelOOaephBav0y0Z5qjyLN1sQUt30e0",
  authDomain: "otp-test-ky.firebaseapp.com",
  projectId: "otp-test-ky",
  storageBucket: "otp-test-ky.firebasestorage.app",
  messagingSenderId: "791037458166",
  appId: "1:791037458166:web:3f870f6f02668774941ed7",
  measurementId: "G-4L4JZT5FF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);