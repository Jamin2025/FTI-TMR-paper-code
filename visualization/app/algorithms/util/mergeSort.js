// mergeSort.js

/**
 * Merge Sort implementation in JavaScript
 * @param {Array} array - The array to be sorted
 * @returns {Array} - The sorted array
 */
function mergeSort(array, less) {
    if (array.length <= 1) {
        return array;
    }

    const middle = Math.floor(array.length / 2);
    const left = mergeSort(array.slice(0, middle));
    const right = mergeSort(array.slice(middle));

    return merge(left, right, less);
}

/**
 * Merge two sorted arrays into one sorted array
 * @param {Array} left - The left sorted array
 * @param {Array} right - The right sorted array
 * @returns {Array} - The merged sorted array
 */
function merge(left, right, less) {
    const result = [];
    let i = 0, j = 0;
    const lL = left.length, rL = right.length;
    while (i < lL && j < rL) {
        if (less(left[i], right[j])) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }

    // Add remaining elements from left and right arrays
    return result.concat(left.slice(i)).concat(right.slice(j));
}


export class MergeSort {
    less(a, b) {
        return a < b;
    }
    constructor(comparator) {
        this.less = comparator || this.less;
    }

    sort(array) {
        return mergeSort(array, this.less);
    }
    sortSortedArrs(...arrs) {
        const len = arrs.length;
        if (len === 0) return [];
        if (len === 1) return arrs[0];
        
        // Flatten the array of arrays
        const flattened = arrs.reduce((acc, arr) => merge(arr, acc, this.less), []);
        return flattened
    }
}