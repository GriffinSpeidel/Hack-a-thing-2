import {useState} from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import './dressup.css';
import vitruvian from './vitruvian.png';

// from firebase console
const firebaseConfig = {
    apiKey: "AIzaSyB7jxx88wCYh745IDoAnf_QOUPZ6lPvuPU",
    authDomain: "dress-up-f17f8.firebaseapp.com",
    projectId: "dress-up-f17f8",
    storageBucket: "dress-up-f17f8.firebasestorage.app",
    messagingSenderId: "844245990665",
    appId: "1:844245990665:web:6cd4485ddbc8d67e7667d8"
};

// initialize references to app and db based on the config above
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
    return <>
        <h1>Welcome to the Dress-Up Game!</h1>
        <div className="image-container">
            <img src={vitruvian} alt="Vitruvian Man" />
        </div>
    </>;
}

createRoot(document.getElementById("root")).render(
    <App />
);