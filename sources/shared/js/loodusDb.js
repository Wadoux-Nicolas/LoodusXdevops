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
        const loodusDocuments = ['parameters', 'calculator'];

        request.onupgradeneeded = (e) => {
            for (let document of loodusDocuments) {
                if (!e.target.result.objectStoreNames.contains(document)) { // if there's no "parameters" store
                    e.target.result.createObjectStore(document, {keyPath: 'id'}); // create it
                }
            }
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
        return new Promise((resolve, reject) => {
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
            // If there's no parameters in the db, create them
            if (allParameters.result.length <= 0) {
                let success = 0;
                defaultParameterValues.forEach(parameter => {
                    const request = parameters.add(parameter);
                    request.onsuccess = () => {
                        success++;
                        if(success >= defaultParameterValues.length) {
                            resolve(loodusDb.db);
                        }
                    };

                    request.onerror = () => {
                        reject(request.error);
                    };
                });
            } else {
                resolve(loodusDb.db);
            }
        }
    });
}

export const defaultParameterValues = [
    {
        id: 'dateParameters',
        data: {
            display: true,
            displayDay: true,
            displayMonth: true,
            displayYear: true,
        }
    },
    {
        id: 'hourParameters',
        data: {
            displayHour: true,
            displayMinute: true,
            displaySecond: true,
        }
    },
    {
        id: 'vibrationParameters',
        data: {
            displayVibrationStatus: true,
            enableVibration: true,
        }
    },
    {
        id: 'batteryParameters',
        data: {
            displayBatteryStatus: true,
        }
    },
    {
        id: 'lockParameters',
        data: {
            unlockMethod: 'free', // pattern or password or free (no lock)
            value: null,
        }
    },
    {
        id: 'displayParameters',
        data: {
            theme: 'light', // light or dark
        }
    },
    {
        id: 'networkLatencyParameters',
        data: {
            displayNetworkLatency: true,
            domain: 'loodus.nicolas-wadoux.fr',
            delay: 2000,
        }
    },
];