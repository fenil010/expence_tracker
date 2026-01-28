/**
 * LocalStorage CRUD Utilities
 * 
 * Pure functions for reading/writing expense data to LocalStorage.
 * Designed for easy replacement with a backend API later.
 */

import { STORAGE_KEY, DEFAULT_DATA } from './schema';

// ============================================================================
// CORE CRUD OPERATIONS
// ============================================================================

/**
 * Load expense data from LocalStorage.
 * Initializes with DEFAULT_DATA if no data exists.
 * 
 * @returns {import('./schema').ExpenseData}
 */
export function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            // First time user - seed with defaults
            saveData(DEFAULT_DATA);
            return structuredClone(DEFAULT_DATA);
        }

        return JSON.parse(raw);
    } catch (error) {
        console.error('[Storage] Failed to load data:', error);
        // Fallback to defaults on corruption
        return structuredClone(DEFAULT_DATA);
    }
}

/**
 * Save expense data to LocalStorage.
 * Performs atomic write of entire state.
 * 
 * @param {import('./schema').ExpenseData} data
 * @returns {boolean} Success status
 */
export function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('[Storage] Failed to save data:', error);
        return false;
    }
}

/**
 * Clear all data and re-seed with defaults.
 * Useful for demo reset functionality.
 * 
 * @returns {import('./schema').ExpenseData} Fresh default data
 */
export function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    saveData(DEFAULT_DATA);
    return structuredClone(DEFAULT_DATA);
}

/**
 * Check if LocalStorage is available.
 * 
 * @returns {boolean}
 */
export function isStorageAvailable() {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
}
