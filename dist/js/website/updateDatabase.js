/**
 * @file Local to remote database sync
 */
import delay from 'delay';
import { db } from './database';
/**
 * Infinite update loop
 */
export async function update() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        console.info('Starting update ... ...');
        await Promise.allSettled([
            updateLatestData(),
            updateLatestError(),
            async () => {
                await updateIndex();
            },
        ]);
        await delay(2000);
    }
}
/**
 * Fetches latest values and adds them to database
 */
async function updateLatestData() {
    const lastTimestamp = await db.getLastDataTimestamp();
    const data = await (await fetch('/data?from=' + lastTimestamp)).json();
    console.log('Fetched ' + data.length + ' data elements from server.');
    await db.storeData(data);
}
/**
 * Fetches latest values and adds them to database
 */
async function updateLatestError() {
    const lastTimestamp = await db.getLastErrorTimestamp();
    const error = await (await fetch('/error?from=' + lastTimestamp)).json();
    console.log('Fetched ' + error.length + ' error elements from server.');
    await db.storeError(error);
}
/**
 * Fetches index. Stores index in database.
 */
async function updateIndex() {
    const index = await (await fetch('/static/index')).json();
    await db.storeIndex(index);
}
/**
 * Fetches a single, unfetched file from index and stores it in database
 */
async function fetchSingleUnfetched() {
}
