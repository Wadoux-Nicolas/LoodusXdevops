import LoodusDb from "./loodusDb";


export async function handleThemeMode() {
    const loodusDb = new LoodusDb();
    await loodusDb.openDb();

    const { data: { themeMode } } = await loodusDb.get('parameters', 'theme');

    switch (themeMode) {
        case 'dark':
            addDarkMode();
            break;
        case 'light':
            addLightMode();
            break;
        case 'auto':
            const preferenceQuery = window.matchMedia("(prefers-color-scheme: dark)");
            preferenceQuery.addEventListener("change", checkPreference);
            checkPreference(preferenceQuery);
            break;
    }

    document.addEventListener('parameters-updated', () => handleThemeMode());
}

function addDarkMode() {
    document.body.classList.remove("theme--light");
    document.body.classList.add("theme--dark");
}

function addLightMode() {
    document.body.classList.remove("theme--dark");
    document.body.classList.add("theme--light");
}

function checkPreference(preferenceQuery) {
    preferenceQuery.matches ? addDarkMode() : addLightMode();
}
