import "./parameters.scss"
import {parametersTagName} from "./parameters-helper";
import {getUrl} from "../../shared/helper";
import LoodusDb, {defaultParameterValues} from "../../shared/LoodusDb";

class Parameters extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch(getUrl("features/parameters/parameters.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        // new instance of LoodusDb
        const loodusDb = new LoodusDb();
        // await for db to be opened
        await loodusDb.openDb();
    }
}

customElements.define(parametersTagName, Parameters);

