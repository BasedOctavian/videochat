//firebase/config.ts
export const firebaseConfig = {
    apiKey: "AIzaSyCgP8SkzrL-R_mTBQHHmJM718SsoWF6hB4",
    authDomain: "outoften-9e12b.firebaseapp.com",
    projectId: "outoften-9e12b",
    storageBucket: "outoften-9e12b.firebasestorage.app",
    messagingSenderId: "968891899721",
    appId: "1:968891899721:web:f5aa7eaa4685cb86a24498",
    measurementId: "G-V7RSYFJP9F"
  };
  
  export const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };