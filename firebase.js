// Import Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Import Firestore (database)
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔑 YOUR FIREBASE CONFIG (FROM YOU)
const firebaseConfig = {
  apiKey: "AIzaSyBJneY1E9Pdh47zQP_EEOma7Uta_cFXwBw",
  authDomain: "typingexamportal-c9874.firebaseapp.com",
  projectId: "typingexamportal-c9874",
  storageBucket: "typingexamportal-c9874.firebasestorage.app",
  messagingSenderId: "968196378362",
  appId: "1:968196378362:web:b3ee5839c1365f3608c343"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

/* ================= SAVE SCORE ================= */
export async function saveScore(data) {
  await addDoc(collection(db, "leaderboard"), {
    name: data.name,
    wpm: data.wpm,
    accuracy: data.accuracy,
    score: data.score,
    difficulty: data.difficulty,
    date: new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  });
}

/* ================= LOAD TODAY LEADERBOARD ================= */
export async function loadLeaderboard() {
  const today = new Date().toISOString().slice(0, 10);

  const q = query(
    collection(db, "leaderboard"),
    where("date", "==", today),
    orderBy("wpm", "desc"),
    orderBy("accuracy", "desc"),
    limit(10)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}
