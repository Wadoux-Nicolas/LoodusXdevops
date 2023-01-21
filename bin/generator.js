// function to show options available

function showHelp() {
    console.log(`
How to execute the command :

node bin/generator <feature|component> myModal <-options>

Options available:

    -m, --modal: create a modal component, example: node bin/generator feature myModal -m

    -h, --help: show this help
`);
}

// create the component
function createComponent() {
    /* DECLARE VARIABLES AND FUNCTIONS */
    const fs = require('fs');
    const path = require('path');
    const formatComponentNameToVariable = str => str[0].toLowerCase() + str.slice(1) + 'TagName';
    const formatComponentNameToFileName = str => str[0].toLowerCase() + str.slice(1).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

    const [, , dirType, componentName, ...options] = process.argv;
    const formattedComponentName = formatComponentNameToFileName(componentName);
    const variableComponentName = formatComponentNameToVariable(componentName);
    const classComponentName = componentName[0].toUpperCase() + componentName.slice(1);
    const dir = (dirType === 'f' || dirType === 'feature') ? 'features' : 'shared/components';

    const pathToComponent = path.join(__dirname, '..', 'sources', dir, formattedComponentName);

    const createHtml = () => {
        const html =
`<section id="${formattedComponentName}">
    <p>${formattedComponentName} is working</p>
</section>
<script src="./${formattedComponentName}.js" type="module"></script>`;
        fs.writeFileSync(path.join(pathToComponent, `${formattedComponentName}.html`), html);
    }

    const createHtmlModal = () => {
        const html =
`<section id="${formattedComponentName}">
    <div id="modal-header">
        <h1 class="text2">${formattedComponentName}</h1>
    </div>
    <div id="modal-content">
        <p>${formattedComponentName} is working</p>
    </div>
</section>
<script src="./${formattedComponentName}.js" type="module"></script>`;
        fs.writeFileSync(path.join(pathToComponent, `${formattedComponentName}.html`), html);
    }

    const createScss = () => {
        const scss =
`@import "sources/shared/assets/styles/theme";

#${formattedComponentName} {
    @include theme() {
        // write your styles here
    }
}`;

        fs.writeFileSync(path.join(pathToComponent, `${formattedComponentName}.scss`), scss);
    }

    const createHelpers = () => {
        const tag = dir === 'features' ? 'feature' : 'component';
        const helpers = `export const ${variableComponentName} = "${formattedComponentName}-${tag}";`;

        fs.writeFileSync(path.join(pathToComponent, `${formattedComponentName}-helpers.js`), helpers);
    }

    const createJs = () => {
        const js =
`import "./${formattedComponentName}.scss"
import {${variableComponentName}} from "./${formattedComponentName}-helpers";
import {getUrl} from "../../shared/js/helper";

class ${classComponentName} extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch(getUrl("${dir}/${formattedComponentName}/${formattedComponentName}.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        // Write your code here, it will be executed when the component is loaded
    }
}

customElements.define(${variableComponentName}, ${classComponentName});
`;

        fs.writeFileSync(path.join(pathToComponent, `${formattedComponentName}.js`), js);
    }

    /* CREATE COMPONENT */

    fs.mkdirSync(pathToComponent);

    if(options.includes('-m') || options.includes('-modal')) {
        createHtmlModal();
    } else {
        createHtml();
    }

    createScss();
    createHelpers();
    createJs();

    console.log(`Component ${componentName} created in ${pathToComponent}`);
}

if(process.argv.includes('-h') || process.argv.includes('-help')) {
    showHelp();
} else {
    createComponent();
}