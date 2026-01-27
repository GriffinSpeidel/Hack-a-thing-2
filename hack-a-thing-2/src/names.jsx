import {useState} from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';


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

// gets names from the 'test' collection and returns them as an array of strings
async function getNames(db) {
  const namesCol = collection(db, 'test');
  const namesSnapshot = await getDocs(namesCol);
  const namesList = namesSnapshot.docs.map(doc => doc.data());
  return namesList.map(item => item.name);
}

function App() {
    // define the state variable for names
    const [names, setNames] = useState([]);

    async function handleClick(db) {
        setNames(await getNames(db));
    }

    return <>
        <h1>Hello, Hack a Thing 2!</h1>
        <label>
            Fetch names: <button onClick={async () => {
                await handleClick(db);
            }}>Fetch</button>
        </label>
        <ul>
            {names.map((name, index) => (
                <li key={index}>{name}</li>
            ))}
        </ul>
    </>;
}

createRoot(document.getElementById("root")).render(
    <App />
);