import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAV-cTGkgkD_YBiG9ZLYApWVDsCjWuGUtQ",
  authDomain: "kivun-learning.firebaseapp.com",
  projectId: "kivun-learning",
  storageBucket: "kivun-learning.firebasestorage.app",
  messagingSenderId: "467941047744",
  appId: "1:467941047744:web:fd995c3bfef2d2d8d69c25",
  measurementId: "G-J9QTRVFRWK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/*
 * יש לקרוא לפונקציה לפני ביצוע הכניסה.
 *
 * true: שמירת ההתחברות גם לאחר סגירת הדפדפן.
 * false: שמירת ההתחברות למשך ההפעלה הנוכחית.
 *
 * הפונקציה אינה שומרת את הסיסמה.
 */
async function configureLoginPersistence(rememberMe) {
  await setPersistence(
    auth,
    rememberMe
      ? browserLocalPersistence
      : browserSessionPersistence
  );
}

export {
  auth,
  db,

  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,

  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  configureLoginPersistence,

  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment
};