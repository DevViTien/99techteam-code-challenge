/**
 * Approach C: Array Reduction (Functional Programming)
 * Time Complexity: O(n)
 * Space Complexity: O(n) due to array creation
 * 
 * Uses functional programming approach with Array.from() and reduce().
 * This demonstrates modern JavaScript functional programming patterns
 * and is more memory-efficient than deep recursion.
 */
var sum_to_n_c = function(n) {
    // Input validation
    if (n < 1 || !Number.isInteger(n) || n >= Number.MAX_SAFE_INTEGER) {
        throw new Error('Input must be a positive integer less than Number.MAX_SAFE_INTEGER');
    }
    
    // Create array [1, 2, 3, ..., n] and reduce to sum
    // Array.from({ length: n }, (_, i) => i + 1) creates [1, 2, ..., n]
    // Then reduce with addition to get the sum
    return Array.from({ length: n }, (_, i) => i + 1)
                .reduce((sum, current) => sum + current, 0);
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sum_to_n_c;
}
