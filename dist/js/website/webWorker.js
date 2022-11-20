/**
 * @file Custom hook to use the shared webworker
 */
const fetchWorker = new SharedWorker('worker.js', { credentials: 'same-origin' });
fetchWorker.addEventListener('error', (err) => console.warn('Worker failed!', { err }));
/**
 * Custom hook to use the shared fetch worker
 *
 * @returns React component
 */
export function useWorker() {
    return fetchWorker;
}
