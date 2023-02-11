import "./parameters.scss"
import {parametersTagName} from "./parameters-helper";
import {camelCase, getUrl} from "../../shared/js/helper";
import LoodusDb from "../../shared/js/loodusDb";

class Parameters extends HTMLElement {
    constructor() {
        super();
    }

    loodusDb = null;

    get allInputParam() {
        return this.querySelectorAll('.input-param');
    }

    get securityChanged() {
        return this.querySelector('#security-changed');
    }

    get allMenuButtons() {
        return this.querySelectorAll(".menu-button");
    }

    get paramSectionIsOpen() {
        return this.querySelector(".is-open");
    }

    get menuButtonIsActive() {
        return this.querySelector('.active');
    }

    get lockInputs() {
        return this.querySelectorAll('.lock-method');
    }

    async connectedCallback() {
        await fetch(getUrl("features/parameters/parameters.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        // new instance of LoodusDb
        this.loodusDb = new LoodusDb();
        // await for db to be opened
        await this.loodusDb.openDb();

        await this.initParameters(this.loodusDb, 'network-param');

        this.allInputParam.forEach(input => input.addEventListener("input", () => this.onParamChange(input, this.loodusDb)));
        this.allMenuButtons.forEach(button => button.addEventListener("click", () => this.onMenuButtonClick(button, this.loodusDb)));

        this.updatePatternParamValue = this.updatePatternParamValue.bind(this)
        document.addEventListener('pattern-lock-submitted', this.updatePatternParamValue)

        this.querySelector('#lock-by-password').addEventListener('submit', evt => {
            evt.preventDefault();
            const input = this.querySelector('#lock-password-input');

            this.updateParamValue(
                {
                    unlockMethod: input.type,
                    value: input.value
                },
                'lock',
                this.loodusDb,
            ).then(() => {
                input.value = '';
                this.securityChanged.classList.remove('hidden');
            })
        });
    }

    disconnectedCallback() {
        document.removeEventListener('pattern-lock-submitted', this.updatePatternParamValue)
    }

    updatePatternParamValue(event) {
        this.updateParamValue({
                unlockMethod: 'pattern',
                value: event.detail.pattern
            },
            'lock',
            this.loodusDb
        ).then(() => {
            this.securityChanged.classList.remove('hidden');
        })
    }

    onParamChange(input, loodusDb) {
        this.securityChanged.classList.add('hidden');
        const documentId = input.getAttribute('data-document');
        const key = camelCase(input.getAttribute('id'));

        switch (input.type) {
            case 'checkbox':
                this.updateParamValue({
                    [key]: input.checked
                }, documentId, loodusDb);
                break;
            case 'text':
                this.updateParamValue({
                    [key]: input.value
                }, documentId, loodusDb);
                break;
            case 'number':
                if (input.value !== '') {
                    this.updateParamValue({
                        [key]: input.value
                    }, documentId, loodusDb);
                }
                break;
            case 'select-one':
                if (documentId === 'lock') {
                    this.updateParamValue({
                        unlockMethod: 'free',
                        value: undefined,
                    }, documentId, loodusDb);
                    this.handleDisplayLockInputs(input);
                    break;
                }

                this.updateParamValue({
                    [key]: input.value
                }, documentId, loodusDb);
                break;
        }

    }

    async onMenuButtonClick(button, loodusDb) {
        this.securityChanged.classList.add('hidden');

        const buttonId = button.id;
        const section = this.getSectionByButton(buttonId);
        const openedSection = this.paramSectionIsOpen;
        const activeMenuButton = this.menuButtonIsActive;

        await this.initParameters(loodusDb, section.getAttribute('id'));

        openedSection.classList.remove('is-open');
        openedSection.classList.add('hidden');
        section.classList.remove('hidden');
        section.classList.add("is-open");
        activeMenuButton.classList.remove('active');
        button.classList.add('active');
    }

    getSectionByButton(buttonId) {
        return this.querySelector(`#${buttonId}-param`);
    }

    async initParameters(loodusDb, sectionId) {
        const dbParameters = await loodusDb.getAll('parameters')
        const params = dbParameters.find(p => p.id === sectionId.replace('-param', ''));
        const section = this.getParamSection(sectionId);
        const inputParams = section.querySelectorAll('.input-param')

        for (const input of inputParams) {
            const inputName = camelCase(input.getAttribute('id'));

            switch (input.type) {
                case 'checkbox':
                    input.checked = params.data[inputName];
                    break;
                case 'text':
                    input.value = params.data[inputName];
                    break;
                case 'number':
                    input.value = params.data[inputName];
                    break;
                case 'select-one':
                    input.value = params.data[inputName];
                    if (input.id === 'unlock-method') {
                        this.handleDisplayLockInputs(input);
                    }
                    break;
            }
        }
    }

    getParamSection(section) {
        return this.querySelector(`#${section}`);
    }

    updateParamValue(value, documentId, loodusDb) {
        return loodusDb.set(
            'parameters',
            documentId,
            value
        ).then(() =>
            window.document.dispatchEvent(new CustomEvent('parameters-updated', {
                detail: {
                    documentId,
                }
            }))
        ).catch(err => console.error(err));
    }

    handleDisplayLockInputs(input) {
        const lockInputs = this.lockInputs;

        for (const lockInput of lockInputs) {
            const elementId = lockInput.getAttribute('id');
            const id = elementId.replace('lock-by-', '');

            if (id === input.value) {
                document.getElementById(elementId).classList.remove('hidden');
            } else {
                document.getElementById(elementId).classList.add('hidden');
            }
        }
    }
}

customElements.define(parametersTagName, Parameters);
