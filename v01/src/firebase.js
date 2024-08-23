// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';  // 이 줄을 추가합니다.

const firebaseConfig = {
    apiKey: "AIzaSyCctz9KkBXU4lNPnzdqJNFF7aCh-kiuAY4",
    authDomain: "firewater-72e07.firebaseapp.com",
    projectId: "firewater-72e07",
    storageBucket: "firewater-72e07.appspot.com",
    messagingSenderId: "831381887142",
    appId: "1:831381887142:web:a9625cc3c3a2e8469e7c67",
    measurementId: "G-GGXD9F1LFW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  // 이 줄을 추가합니다.

export { auth, db, storage };  // storage를 export 목록에 추가합니다.