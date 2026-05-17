function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj; // Return the value if obj is not an object
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepCopy(item)); // Handle arrays
    }

    const copy = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deepCopy(obj[key]); // Recursively copy properties
        }
    }
    return copy;
}

module.exports = deepCopy;