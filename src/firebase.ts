// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgP8SkzrL-R_mTBQHHmJM718SsoWF6hB4",
  authDomain: "outoften-9e12b.firebaseapp.com",
  projectId: "outoften-9e12b",
  storageBucket: "outoften-9e12b.firebasestorage.app",
  messagingSenderId: "968891899721",
  appId: "1:968891899721:web:f5aa7eaa4685cb86a24498",
  measurementId: "G-V7RSYFJP9F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);