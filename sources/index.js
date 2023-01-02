import './index.scss';

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const btn = document.querySelector("button");
    const preferenceQuery = window.matchMedia("(prefers-color-scheme: dark)");

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