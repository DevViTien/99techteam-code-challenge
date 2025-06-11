/**
 * Approach A: Mathematical Formula (Gauss Formula)
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 * 
 * Uses the arithmetic series formula: n * (n + 1) / 2
 * This is the most efficient approach as it calculates the result directly
 * without any loops or recursion.
 */
var sum_to_n_a = function(n) {
    // Input validation
    if (n < 1 || !Number.isInteger(n) || n >= Number.MAX_SAFE_INTEGER) {
        throw new Error('Input must be a positive integer less than Number.MAX_SAFE_INTEGER');
    }
    
    // Gauss formula: sum = n * (n + 1) / 2
    return (n * (n + 1)) / 2;
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sum_to_n_a;
}
