// src/data/dataGenerator.js

/**
 * Generates an array of customer objects.
 * @param {number} count - The number of records to generate.
 */
export const generateCustomers = (count) => {
  console.log(`Generating ${count} records...`);
  const customers = [];

  for (let i = 0; i < count; i++) {
    customers.push({
      id: i + 1,
      name: `Customer Name ${i + 1}`,
      phone: `(555) ${String(i).padStart(3, '0')}-${String(i)
        .padStart(4, '0')
        .slice(-4)}`,
      email: `user${i + 1}@corp.com`,
      score: Math.floor(Math.random() * 10000),
      lastMessageAt: Date.now() - Math.floor(Math.random() * 10000000000),
      addedBy: i % 2 === 0 ? 'Admin' : 'Guest',
      avatar: `https://i.pravatar.cc/150?img=${i % 70}`,
    });
  }

  console.log('Data generation complete.');
  return customers;
};

// Define the number of records (1 Million)
export const MAX_RECORDS = 1000000;
