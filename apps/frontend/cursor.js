/**
 * Recursive Fibonacci function
 * @param {number} n - The position in the Fibonacci sequence
 * @returns {number} The nth Fibonacci number
 */
function fibonacci(n) {
    // Base cases
    if (n <= 0) {
        return 0;
    }
    if (n === 1) {
        return 1;
    }
    
    // Recursive case: F(n) = F(n-1) + F(n-2)
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Example usage
console.log("Fibonacci sequence:");
for (let i = 0; i <= 10; i++) {
    console.log(`F(${i}) = ${fibonacci(i)}`);
}

// Export for use in other modules
module.exports = fibonacci;
