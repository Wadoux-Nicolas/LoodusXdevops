import {LoodusDbError} from "./error";

class LoodusDb {
    db;

    constructor() {
    }

    openDb() {
        if (!window.indexedDB) {
            console.log({message: 'Unsupported indexedDB'});
        }

        const request = window.indexedDB.open("loodusDb", 1);

        request.onupgradeneeded = (e) => {
            if (!e.target.result.objectStoreNames.contains('parameters')) { // if there's no "parameters" store
                e.target.result.createObjectStore('parameters', {keyPath: 'id'}); // create it
            }
            if (!e.target.result.objectStoreNames.contains('calculator')) { // if there's no "calculator" store
                e.target.result.createObjectStore('calculator', {keyPath: 'id'}); // create it
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

                if(hardMode || !objectToUpdate.result?.data) {
                    // create id or completely erase the previous data
                    console.log('hard')
                    newObject['data'] = object;
                } else {
                    if (Array.isArray(objectToUpdate.result.data)) {
                        const newArray = [...objectToUpdate.result.data];
                        newArray.push(...object);
                        newObject['data'] = newArray;
                    } else {
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
        id: 'networkLatencyParameters',
        data: {
            displayNetworkLatency: true,
            domain: 'loodus.nicolas-wadoux.fr',
            delay: 2000,
        }
    },
];
