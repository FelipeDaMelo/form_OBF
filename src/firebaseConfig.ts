import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; 


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCit31z3mXC17vHSku63qNo0DTQDKA8Go",
  authDomain: "inscricao-obf.firebaseapp.com",
  projectId: "inscricao-obf",
  storageBucket: "inscricao-obf.firebasestorage.app",
  messagingSenderId: "838647640573",
  appId: "1:838647640573:web:384d29f8a7e6b38be06994"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); 

export { db };