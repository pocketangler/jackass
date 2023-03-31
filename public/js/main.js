import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.19.0/firebase-auth.js";

(async function() {

initializeApp({
    apiKey: "AIzaSyDQf7_rWcqFwlN86j1fCt_Oa3N_RSCf2zA",
    authDomain: "pocketangler-v1-5.firebaseapp.com",
    projectId: "pocketangler-v1-5",
    storageBucket: "pocketangler-v1-5.appspot.com",
    messagingSenderId: "202145643651",
    appId: "1:202145643651:web:523cf9ad10da18c64fafb6",
    measurementId: "G-NS7XX03KRE"
});
const auth = getAuth();

let currentUser;

onAuthStateChanged(auth, user => {

    while(!document.body.classList.contains("authentication-initialised"))
        document.body.classList.add("authentication-initialised");

    if(!user)
        while(document.body.classList.contains("authenticated"))
            document.body.classList.remove("authenticated");
    else
        while(!document.body.classList.contains("authenticated"))
            document.body.classList.add("authenticated");
    currentUser = user;

});

for(let button of document.querySelectorAll("button.sign-in"))
    button.addEventListener("click", signIn);
for (let button of document.querySelectorAll("button.sign-out"))
    button.addEventListener("click", () => signOut(auth));

function signIn() {

    const username = prompt("Username");
    const password = username && prompt("Password");
    if(password)
        signInWithEmailAndPassword(auth, username, password);

}

}());
