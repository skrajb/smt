// Firebase SDK (CDN – required for GitHub Pages)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
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

// 🔑 YOUR FIREBASE CONFIG (UNCHANGED)
const firebaseConfig = {
  apiKey: "AIzaSyBJneY1E9Pdh47zQP_EEOma7Uta_cFXwBw",
  authDomain: "typingexamportal-c9874.firebaseapp.com",
  projectId: "typingexamportal-c9874",
  storageBucket: "typingexamportal-c9874.firebasestorage.app",
  messagingSenderId: "968196378362",
  appId: "1:968196378362:web:b3ee5839c1365f3608c343"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= SAVE SCORE ================= */
export async function saveScore(data) {
  await addDoc(collection(db, "leaderboard"), {
    name: data.name,
    wpm: Number(data.wpm),
    accuracy: Number(data.accuracy),
    score: Number(data.score),
    difficulty: data.difficulty,
    date: new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
  });
}

/* ================= LOAD TODAY LEADERBOARD ================= */
export async function loadLeaderboard() {
  const today = new Date().toISOString().slice(0, 10);

  const q = query(
    collection(db, "leaderboard"),
    where("date", "==", today),
    orderBy("wpm", "desc"),
    limit(10)
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data());
}
