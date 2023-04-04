import { initializeApp } from
    "https://www.gstatic.com/firebasejs/9.19.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, connectAuthEmulator } from
    "https://www.gstatic.com/firebasejs/9.19.0/firebase-auth.js";

(async function () {

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
    if (localStorage.getItem("dev-mode")) {
        connectAuthEmulator(auth, "http://localhost:9099");
    }

    let currentUser, currentUserToken;

    onAuthStateChanged(auth, async user => {

        if (navigator.onLine)
            while (!document.body.classList.contains("authentication-initialised"))
                document.body.classList.add("authentication-initialised");

        if (!user)
            while (document.body.classList.contains("authenticated"))
                document.body.classList.remove("authenticated");
        else
            while (!document.body.classList.contains("authenticated"))
                document.body.classList.add("authenticated");
        currentUser = user;
        currentUserToken = currentUser && await currentUser.getIdToken(true);

        document.querySelector(".username").textContent =
            currentUser ? currentUser.displayName || currentUser.email : "";

        if (currentUser) {

            await sampleRiverLevelsQuery({ token: currentUserToken });

        }

    });

    for (let button of document.querySelectorAll("button.sign-in"))
        button.addEventListener("click", signIn);
    for (let button of document.querySelectorAll("button.sign-out"))
        button.addEventListener("click", () => signOut(auth));

    const loginForm = document.querySelector("section.login form");
    if (loginForm) {

        loginForm.addEventListener("submit", async e => {

            e.preventDefault();
            const data = new FormData(loginForm);
            try {
                console.log(data.get("email"), data.get("password"));
                const result = await signInWithEmailAndPassword(auth, data.get("email"), data.get("password"));
                const { user } = result;
                if (user) location.href = "/";
            } catch (err) {
                console.error(err.stack);
            }

        });

    }

    function signIn() {

        const username = prompt("Username");
        const password = username && prompt("Password");
        if (password)
            signInWithEmailAndPassword(auth, username, password);

    }

}());

(async function registerServiceWorker() {

    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("/sw.js", {
                scope: "/",
            });
            if (registration.installing) {
                console.log("Service worker installing");
            } else if (registration.waiting) {
                console.log("Service worker installed");
            } else if (registration.active) {
                console.log("Service worker active");
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }

}());

async function sampleRiverLevelsQuery({ token }) {
    const resp = await fetch("/river-levels", { headers: { "Authorization": `Bearer ${token}` } });
    if (!resp.ok) {
        console.error(resp);
    } else {
        const data = await resp.json();
        const countries = new Map();
        data.forEach(({ _time, riverCountry, riverName, gaugeName, _field, _value }) => {

            if (!countries.has(riverCountry))
                countries.set(riverCountry, new Map());
            const country = countries.get(riverCountry);

            if (!country.has(riverName))
                country.set(riverName, new Map());
            const river = country.get(riverName);

            if (!(river.has(gaugeName)))
                river.set(gaugeName, new Map());
            const gauge = river.get(gaugeName);

            if (!gauge.has(_time))
                gauge.set(_time, {});

            const dataPoint = gauge.get(_time);
            dataPoint[_field] = _value;

        });
        console.log(countries);
    }
}

