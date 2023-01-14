import './index.scss';
import {initDb} from "./shared/js/loodusDb";

document.addEventListener("DOMContentLoaded", async () => {
    const preferenceQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // ------ Theme mode handle ------

    preferenceQuery.addEventListener("change", checkPreference);
    checkPreference(preferenceQuery);

    // ------ Database handle ------

    await initDb();

    // now that everything is setted up, remove loader component and show the app
    // it will trigger connectedCallbacks methods only at this moment
    document.body.innerHTML = `
        <main>
            <section id="home-unlocked">
                <navbar-component></navbar-component>
                <home-feature></home-feature>
                <modal-component></modal-component>
            </section>
            <section id="home-locked">
                <lock-screen-feature></lock-screen-feature>
            </section>
        </main>
        <footer>
            <img src="./shared/assets/images/loodus_text.png" alt="Loodus" class="loodus-icon">
            <button id="home-lock-screen-button" class="btn-icon lock-screen-button">
                <span class="material-icons">lock</span>
            </button>
            <button id="toggle-home-mode" class="btn-icon">
                <span class="material-icons hidden toggle-home-mode-icon">open_in_full</span>
                <span class="material-icons toggle-home-mode-icon">close_fullscreen</span>
            </button>
        </footer>
    `;

    // ------ Home toggler ------

    document.getElementById('toggle-home-mode').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('toggle-home-mode'));
        document.querySelectorAll('.toggle-home-mode-icon').forEach(e => e.classList.toggle('hidden'));
    });

    document.addEventListener('unlock-screen', () => {
        document.body.classList.remove('is-locked');
        document.querySelector('lock-screen-feature').remove(); // to trigger connectedCallback when locking screen
    });

    document.querySelectorAll('.lock-screen-button').forEach(btn => {
        btn.addEventListener('click', () => {
            lockScreen();
        });
    });
});

function lockScreen() {
    document.querySelector('#home-locked').innerHTML = `
        <lock-screen-feature></lock-screen-feature>
    `;
    document.body.classList.add('is-locked');
}

function addDarkMode() {
    document.body.classList.remove("theme--light");
    document.body.classList.add("theme--dark");
}

function addLightMode() {
    document.body.classList.remove("theme--dark");
    document.body.classList.add("theme--light");
}

function toggleTheme() {
    !document.body.classList.contains("theme--dark") ? addDarkMode() : addLightMode();
}

function checkPreference(preferenceQuery) {
    preferenceQuery.matches ? addDarkMode() : addLightMode();
}