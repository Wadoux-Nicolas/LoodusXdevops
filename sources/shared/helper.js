// create a new html element by its tag, with given content, in its parent.
export function _(tag, content, parent, id = null, customClass = null) {
    let element = document.createElement(tag);

    if (content) {
        element.appendChild(document.createTextNode(content));
    }
    if (id) {
        element.id = id;
    }
    if (customClass) {
        element.classList.add(customClass);
    }

    parent.appendChild(element);

    return element;
}

export function vibrate(pattern = 20) {
    // TODO check parameters before vibration
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

export function local() {
    return navigator.language;
}

export function sendNotification(message, options = {}) {
    if(!("Notification" in window)) {
        console.warn("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        new Notification(message, options);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                new Notification(message, options);
            }
        });
    }
}

export function getUrl(url) {
    const base = import.meta.env.DEV ? './' : '/sources/'
    return `${base}${url}`;
}