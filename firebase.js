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

/* 🔑 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyBJneY1E9Pdh47zQP_EEOma7Uta_cFXwBw",
  authDomain: "typingexamportal-c9874.firebaseapp.com",
  projectId: "typingexamportal-c9874",
  storageBucket: "typingexamportal-c9874.firebasestorage.app",
  messagingSenderId: "968196378362",
  appId: "1:968196378362:web:b3ee5839c1365f3608c343"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= SAVE SCORE ================= */
export async function saveScore(data) {
  const now = new Date();
  const localDate =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

  await addDoc(collection(db, "leaderboard"), {
    name: String(data.name),
    wpm: Number(data.wpm),
    accuracy: Number(data.accuracy),
    score: Number(data.score),
    difficulty: data.difficulty,
    date: localDate
  });
}

/* ================= LOAD TODAY LEADERBOARD ============k===== */
export async function loadLeaderboard() {
  const now = new Date();
  const localDate =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

  const q = query(
    collection(db, "leaderboard"),
    where("date", "==", localDate),
    orderBy("wpm", "desc"),
    limit(10)
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data());
}
