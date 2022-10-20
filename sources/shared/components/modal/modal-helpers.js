export const modalTagName = "modal-component";

export function openModal(componentName) {
    const modal = document.querySelector(modalTagName);
    const modalBody = modal.querySelector("#modal-body");

    modalBody.innerHTML = "";
    const component = document.createElement(componentName);
    modalBody.appendChild(component);

    modal.querySelector("#modal").classList.add("is-open");
}

export function closeModal() {
    const modal = document.querySelector(modalTagName);
    const modalBody = modal?.querySelector("#modal-body");

    modal.querySelector("#modal").classList.remove("is-open");
}