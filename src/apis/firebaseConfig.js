// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  getDoc,
  doc,
} from "firebase/firestore";

import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUe3L5GCYDBUacPNOsmigHNeFaEztk8ks",
  authDomain: "practice-bb927.firebaseapp.com",
  projectId: "practice-bb927",
  storageBucket: "practice-bb927.appspot.com",
  messagingSenderId: "51577305339",
  appId: "1:51577305339:web:d75b50785d835b00ae185e",
  measurementId: "G-4XH073XLB0",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const db = getFirestore();
