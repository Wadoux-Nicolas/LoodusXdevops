import './index.scss';

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const btn = document.querySelector("button");
    const preferenceQuery = window.matchMedia("(prefers-color-scheme: dark)");

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
});