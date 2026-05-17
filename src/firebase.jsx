import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAjTy2TmWfwQUht9DMc53eFofPm3RSOqkA",
  authDomain: "fba-command-center-9986b.firebaseapp.com",
  projectId: "fba-command-center-9986b",
  storageBucket: "fba-command-center-9986b.firebasestorage.app",
  messagingSenderId: "680825501808",
  appId: "1:680825501808:web:f5b616f161c7d276fbdcb5",
  measurementId: "G-3P4HRDH3HX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);