import {LoodusDbError} from "./errors";

class LoodusDb {
    db;

    constructor() {
    }

    openDb() {
        if (!window.indexedDB) {
            console.error('Unsupported indexedDB');
            return;
        }

        const request = window.indexedDB.open("loodusDb", 1);
        const loodusDocuments = ['parameters', 'calculator', 'tic-tac-toe'];

        request.onupgradeneeded = async (e) => {
            for (let document of loodusDocuments) {
                if (!e.target.result.objectStoreNames.contains(document)) { // if there's no "parameters" store
                    e.target.result.createObjectStore(document, {keyPath: 'id'}); // create it
                }
            }
            await initDb();
        };

        return new Promise((resolve, reject) => {
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            }
            request.onerror = (e) => {
                reject(e);
                throw new LoodusDbError('Error opening database');
            }
        });
    }

    // usage example
    // loodusDb.getAll('parameters').then(r => console.log(r));
    // be-careful, result can be null !
    getAll(document, query = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(document, 'readwrite');
            const request = transaction.objectStore(document).getAll(query);
            request.onerror = e => reject(e.target.error);
            request.onsuccess = e => resolve(e.target.result);
        });
    }

    // usage example
    // loodusDb.get('parameters', 'hourParameters').then(r => console.log(r));
    // be-careful, result can be null !
    get(document, query) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(document, 'readwrite');
            const request = transaction.objectStore(document).get(query);
            request.onerror = e => reject(e.target.error);
            request.onsuccess = e => resolve(e.target.result);
        });
    }

    set(document, documentId, object, hardMode = false) {
        return new Promise(async (resolve, reject) => {
            const transaction = this.db.transaction(document, 'readwrite');
            const objectToUpdate = transaction.objectStore(document).get(documentId);

            objectToUpdate.onsuccess = () => {
                const newObject = {
                    id: documentId
                }

                if (hardMode || !objectToUpdate.result?.data) {
                    // create id or completely erase the previous data
                    newObject['data'] = object;
                } else {
                    // if data is an array, we simply push new data
                    if (Array.isArray(objectToUpdate.result.data)) {
                        const newArray = [...objectToUpdate.result.data];
                        newArray.push(...object);
                        newObject['data'] = newArray;
                    } else {
                        // data is an object
                        newObject['data'] = {
                            ...objectToUpdate.result.data,
                            ...object
                        };
                    }
                }

                const updateRequest = transaction.objectStore(document).put(newObject);
                updateRequest.onsuccess = resolve;
            };

            objectToUpdate.onerror = function () {
                reject(objectToUpdate.error);
                throw new LoodusDbError('Error setting ' + documentId);
            }
        });
    }
}

export default LoodusDb;

// function used to create a new instance of the database, filled with default values
export async function initDb() {
    const loodusDb = new LoodusDb();
    await loodusDb.openDb();
    const parametersTransaction = loodusDb.db.transaction("parameters", "readwrite");
    const parameters = parametersTransaction.objectStore("parameters");
    const allParameters = parameters.getAll();

    return new Promise((resolve, reject) => {
        allParameters.onsuccess = () => {
            // create in the db the default parameters if they don't exist
            const savedParameters = allParameters.result;

            let updatedParameters = 0;
            const checkResolvingPromise = () => {
                updatedParameters++;
                if (updatedParameters >= defaultParameterValues.length) {
                    resolve(loodusDb.db);
                }
            }
            defaultParameterValues.forEach((defaultParameter) => {
                const savedParameter = savedParameters.find((p) => p.id === defaultParameter.id);

                // we don't have the parameter registered, we create it
                if (!savedParameter) {
                    const request = parameters.add(defaultParameter);
                    request.onsuccess = checkResolvingPromise;
                    request.onerror = reject;
                } else {
                    // we have the parameter registered, we check if we need to had more values

                    // check if at least one value is missing
                    const hasMissingDefaultValues = Object.keys(defaultParameter.data).some((key) => {
                        return !savedParameter.data?.hasOwnProperty(key);
                    });

                    if (hasMissingDefaultValues) {
                        // this new object will automatically have previous saved values and new default values
                        const newParameterData = {
                            ...defaultParameter.data,
                            ...savedParameter.data,
                        }
                        loodusDb.set('parameters', defaultParameter.id, newParameterData, true)
                            .then(checkResolvingPromise)
                            .catch(e => reject(e));
                    } else {
                        checkResolvingPromise();
                    }
                }
            });
        }
    });
}

export const defaultParameterValues = [
    {
        id: 'date',
        data: {
            displayDate: true,
            displayDay: true,
            displayMonth: true,
            displayYear: false,
            displayTime: true,
            displayHours: true,
            displayMinutes: true,
            displaySecondes: false,
        }
    },
    {
        id: 'accessibility',
        data: {
            displayVibrationState: true,
            activeVibration: true,
            displayBatteryState: true,
        }
    },
    {
        id: 'lock',
        data: {
            unlockMethod: 'free', // pattern or password or free (no lock)
            value: null,
        }
    },
    {
        id: 'theme',
        data: {
            themeMode: 'auto', // light or dark
        }
    },
    {
        id: 'network',
        data: {
            displayLatencyNetwork: true,
            domain: 'loodus.nicolas-wadoux.fr',
            delay: 5,
        }
    },
];
