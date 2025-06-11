/**
 * Approach B: Iterative Loop
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 * 
 * Uses a traditional for loop to accumulate the sum.
 * This approach is straightforward and easy to understand.
 */
var sum_to_n_b = function(n) {
    // Input validation
    if (n < 1 || !Number.isInteger(n) || n >= Number.MAX_SAFE_INTEGER) {
        throw new Error('Input must be a positive integer less than Number.MAX_SAFE_INTEGER');
    }
    
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sum_to_n_b;
}
