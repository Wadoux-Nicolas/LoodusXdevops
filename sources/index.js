import './index.scss';
import LoodusDb, {defaultParameterValues} from "./shared/js/loodusDb";
import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
    dsn: "https://ff6681d393ca4380aafb28ed72ac62a2@o4504508123512832.ingest.sentry.io/4504508131901440",
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
});

document.addEventListener("DOMContentLoaded", async () => {
    const body = document.body;
    const btn = document.querySelector("button");
    const preferenceQuery = window.matchMedia("(prefers-color-scheme: dark)");
    let db = new LoodusDb();
    db.openDb().then(db => {
        let transaction = db.transaction("parameters", "readwrite");
        let parameters = transaction.objectStore("parameters");
        const allParameters = parameters.getAll();

        allParameters.onsuccess = function () {
            // If there's no parameters in the db, create them
            if (!allParameters.result.length > 0) {
                defaultParameterValues.forEach(
                    parameter => {
                        const request = parameters.add(parameter);

                        request.onsuccess = function () {
                            console.log("parameter added to the store", request.result);
                        };

                        request.onerror = function () {
                            console.log("Error", request.error);
                        };
                    });
            }

        };

    });;

    // ------ Theme mode handle ------

    const addDarkMode = () => {
        body.classList.remove("theme--light");
        body.classList.add("theme--dark");
    };

    const addLightMode = () => {
        body.classList.remove("theme--dark");
        body.classList.add("theme--light");
    };

    const toggleTheme = () =>
        !body.classList.contains("theme--dark") ? addDarkMode() : addLightMode();

    const checkPreference = () =>
        preferenceQuery.matches ? addDarkMode() : addLightMode();

    btn.addEventListener("click", toggleTheme);
    preferenceQuery.addEventListener("change", checkPreference);
    (() => checkPreference())();

    // ------ Home toggler ------
    document.getElementById('toggle-home-mode').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('toggle-home-mode'));
        document.querySelectorAll('.toggle-home-mode-icon').forEach(e => e.classList.toggle('hidden'));
    });

});
