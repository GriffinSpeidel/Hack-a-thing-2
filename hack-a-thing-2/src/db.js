import { getFirestore, collection, doc, setDoc, onSnapshot } from "firebase/firestore/lite";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyB7jxx88wCYh745IDoAnf_QOUPZ6lPvuPU",
    authDomain: "dress-up-f17f8.firebaseapp.com",
    projectId: "dress-up-f17f8",
    storageBucket: "dress-up-f17f8.firebasestorage.app",
    messagingSenderId: "844245990665",
    appId: "1:844245990665:web:6cd4485ddbc8d67e7667d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Listen to all parts and call the callback whenever data changes
export function subscribeParts(callback) {
    const partsCol = collection(db, "parts");
    return onSnapshot(partsCol, snapshot => {
        const parts = {};
        snapshot.docs.forEach(docSnap => {
            parts[docSnap.id] = docSnap.data();
        });
        callback(parts);
    });
}

// Update a single part's position in Firestore
export async function updatePart(id, position) {
    await setDoc(doc(db, "parts", id), position, { merge: true });
}

export { db };
