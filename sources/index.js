import './index.scss';
import {initDb} from "./shared/js/loodusDb";
import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";
import LoodusImg from "./shared/assets/images/loodus_text.png";
import {handleThemeMode} from "./shared/js/handleThemeMode";

Sentry.init({
    dsn: "https://ff6681d393ca4380aafb28ed72ac62a2@o4504508123512832.ingest.sentry.io/4504508131901440",
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
});

const osErrorHtml = `
    <main>
        <section class="os-loading">
            <p class="text3">Une erreur est survenue pendant le lancement</p>
        </section>
    </main>
`;

const lockSectionHtml = `
    <section id="home-locked">
        <lock-screen-feature></lock-screen-feature>
    </section>
`;

const unlockedSectionHtml = `
    <section id="home-unlocked">
        <navbar-component></navbar-component>
        <home-feature></home-feature>
        <modal-component></modal-component>
    </section>
`;

const bodyHtml = `
    <main>
        ${lockSectionHtml}            
    </main>
    <footer>
        <img src="${LoodusImg}" alt="Loodus" class="loodus-icon">
        <div class="footer-actions hidden-when-locked">
            <button id="home-lock-screen-button" class="btn-icon lock-screen-button">
                <span class="material-icons">lock</span>
            </button>
            <button id="toggle-home-mode" class="btn-icon">
                <span class="material-icons hidden toggle-home-mode-icon">open_in_full</span>
                <span class="material-icons toggle-home-mode-icon">close_fullscreen</span>
            </button>
        </div>
    </footer>
`;

document.addEventListener("DOMContentLoaded", async () => {
    // ------ Database handle ------

    try {
        await initDb();
    } catch (e) {
        console.error(e);
        document.body.innerHTML = osErrorHtml;
        return;
    }

    await handleThemeMode();

    // now that everything is setted up, remove loader component and show the app
    // it will trigger connectedCallbacks methods only at this moment
    document.body.innerHTML = bodyHtml;

    // ------ Home toggler ------

    document.getElementById('toggle-home-mode').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('toggle-home-mode'));
        document.querySelectorAll('.toggle-home-mode-icon').forEach(e => e.classList.toggle('hidden'));
    });

    document.addEventListener('unlock-screen', () => {
        unlockScreen();
    });

    document.querySelectorAll('.lock-screen-button').forEach(btn => {
        btn.addEventListener('click', () => {
            lockScreen();
        });
    });
});

function lockScreen() {
    document.body.classList.add('is-locked');
    document.querySelector('main').innerHTML = lockSectionHtml;
}

function unlockScreen() {
    document.body.classList.remove('is-locked');
    document.querySelector('main').innerHTML = unlockedSectionHtml;
}
