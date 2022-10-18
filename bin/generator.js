const fs = require('fs');
const path = require('path');
const formatComponentNameToVariable = str => str[0].toLowerCase() + str.slice(1) + 'TagName';
const formatComponentNameToFileName = str => str[0].toLowerCase() + str.slice(1).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

const [, , dirType, componentName] = process.argv;
const formattedComponentName = formatComponentNameToFileName(componentName);
const variableComponentName = formatComponentNameToVariable(componentName);
const classComponentName = componentName[0].toUpperCase() + componentName.slice(1);
const dir = (dirType === 'f' || dirType === 'feature') ? 'features' : 'shared/components';

const scssImport = dir === 'features' ? '../../shared/assets/styles/themes/theme.scss' : '../../../shared/assets/styles/themes/theme.scss';
const pathToComponent = path.join(__dirname, '..', 'sources', dir, formattedComponentName);

const createComponent = () => {
    fs.mkdirSync(pathToComponent);
    createHtml();
    createScss();
    createHelpers();
    createJs();
};

const createHtml = () => {
    const html =
`<section id="${formattedComponentName}">
    <p>${formattedComponentName} is working</p>
</section>
<script src="./${formattedComponentName}.js" type="module"></script>`;
    fs.writeFileSync(path.join(pathToComponent, `${formattedComponentName}.html`), html);
}

const createScss = () => {
    const scss =
`@import "${scssImport}";

#${formattedComponentName} {
    @include themed() {
        background: t(base0);
        color: t(base1);
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

fetch("${dir}/${formattedComponentName}/${formattedComponentName}.html")
    .then(response => response.text())
    .then(html => define(html));

function define(html) {
    class ${classComponentName} extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.innerHTML = html;
        }
    }
    customElements.define(${variableComponentName}, ${classComponentName});
}`;

    fs.writeFileSync(path.join(pathToComponent, `${formattedComponentName}.js`), js);
}

createComponent();