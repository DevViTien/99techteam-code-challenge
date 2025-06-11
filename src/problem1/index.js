/**
 * Problem 1: Three ways to sum to n
 * 
 * This file demonstrates the three different implementations
 * by importing them and running examples.
 */

// Import the three function implementations
const sum_to_n_a = require('./sum_to_n_a.js');
const sum_to_n_b = require('./sum_to_n_b.js');
const sum_to_n_c = require('./sum_to_n_c.js');

// Example usage and demonstration
console.log('=== Problem 1: Three Ways to Sum to n ===\n');

const testCases = [1, 5, 10, 100, 1000];

testCases.forEach(n => {
    console.log(`Testing n = ${n}:`);
    console.log(`  Method A (Formula):   ${sum_to_n_a(n)}`);
    console.log(`  Method B (Loop):      ${sum_to_n_b(n)}`);
    console.log(`  Method C (Functional): ${sum_to_n_c(n)}`);
    console.log(`  All methods match:    ${sum_to_n_a(n) === sum_to_n_b(n) && sum_to_n_b(n) === sum_to_n_c(n)}\n`);
});

// Performance comparison for larger numbers
console.log('=== Performance Comparison (n = 10000) ===');
const largeN = 10000;

console.time('Method A (Formula)');
const resultA = sum_to_n_a(largeN);
console.timeEnd('Method A (Formula)');

console.time('Method B (Loop)');
const resultB = sum_to_n_b(largeN);
console.timeEnd('Method B (Loop)');

console.time('Method C (Functional)');
const resultC = sum_to_n_c(largeN);
console.timeEnd('Method C (Functional)');

console.log(`Results: A=${resultA}, B=${resultB}, C=${resultC}`);
console.log(`All results match: ${resultA === resultB && resultB === resultC}`);
