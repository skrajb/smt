// firebase.js
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
  storageBucket: "typingexamportal-c9874.appspot.com",
  messagingSenderId: "968196378362",
  appId: "1:968196378362:web:b3ee5839c1365f3608c343"
};

/* INIT */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* SAVE SCORE */
export async function saveScore(data) {
  const now = new Date();
  const date =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

  await addDoc(collection(db, "leaderboard"), {
    name: String(data.name),
    wpm: Number(data.wpm),
    accuracy: Number(data.accuracy),
    score: Number(data.score),
    difficulty: data.difficulty,
    date
  });
}

/* LOAD TODAY TOP 10 BY DIFFICULTY */
export async function loadLeaderboard(difficulty) {
  const now = new Date();
  const date =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

  const q = query(
    collection(db, "leaderboard"),
    where("date", "==", date),
    where("difficulty", "==", difficulty),
    orderBy("wpm", "desc"),
    limit(10)
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}
