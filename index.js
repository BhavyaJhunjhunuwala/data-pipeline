// Assignment 1: Data Processing Pipeline with Array and String 

// Manipulations
// Focus Concepts: map, looping, array methods, string methods

// Description: Build a Node.js command-line tool that processes a large JSON dataset (e.g., a file with 10,000+ entries of user data including names, emails, and addresses). The tool should read the file, validate and transform the data using array methods like map, filter, reduce, and sort, combined with string methods such as split, trim, replace, and toLowerCase. Implement custom looping (for/while loops) for performance-critical sections to avoid recursion depth issues.


// Requirements:

// Use fs module to read/write files synchronously and asynchronously.
// Implement data cleaning: Normalize emails (lowercase, trim whitespace), split full names into first/last, and filter out invalid entries (e.g., missing fields or invalid email formats using regex).


// Generate statistics: Use reduce to count occurrences of domains in emails and top cities from addresses.


// Output a transformed JSON file and a summary report in console.
// Add error handling for file I/O and edge cases like empty arrays or malformed JSON.


// Challenge: Optimize for large datasets by chunking arrays in loops to prevent memory overflow, and benchmark execution time using console.time.


// Bonus: Implement a CLI flag (using process.argv) to switch between different transformation modes.
// // 



const fs = require('fs');



function validateEmail(email) {
  const re  = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}



// Function to process users in chunks 
function processUsersInChunks(users, chunkSize = 1000) {
  const transformed = [];
  const domainCounts = {};
  const cityCounts = {};

  console.time('processing');

  for (let i = 0; i < users.length; i += chunkSize) {
    const chunk = users.slice(i, i + chunkSize);
    const cleanedChunk = [];

    // Custom for loop for cleaning and transforming
    
    for (let j = 0; j < chunk.length; j++) {
      const user = chunk[j];
      if (!user.name || !user.email || !user.address) continue;

      const email = user.email.trim().toLowerCase().replace(/\s+/g, ''); 
      if (!validateEmail(email)) continue;

      const nameParts = user.name.trim().split(/\s+/);
      if (nameParts.length < 2) continue; // Need at least first and last
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');


      
      const addressParts = user.address.split(',').map(part => part.trim());
      if (addressParts.length < 3) continue;
      const city = addressParts[1];

      const transformedUser = { firstName, lastName, email, city };
      cleanedChunk.push(transformedUser);

      // Update domain count
      const domain = email.split('@')[1];
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;

      // Update city count
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    }

    // Append to main transformed array
    transformed.push(...cleanedChunk);
  }

  console.timeEnd('processing');

  return { transformed, domainCounts, cityCounts };
}


// Function for top N items
function getTopItems(counts, n = 10) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1]) //descending order
    .slice(0, n);
}


// Main function
function main() {
  // Parse CLI flags
  
  let mode = 'default';
  for (let arg of process.argv.slice(2)) {
    if (arg.startsWith('--mode=')) {
      mode = arg.split('=')[1];
    }
  }

  
  console.log(`Running in mode: ${mode}`);

  // Input and output files
  const inputFile = 'data.json';
  const outputFile = 'transformed.json';

  // Read file synchronously
  let data;
  
  try {
    data = fs.readFileSync(inputFile, 'utf8');
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
    return;
  }
  
  // Parse JSON
  let users;
  try {
    users = JSON.parse(data);
    if (!Array.isArray(users)) {
      throw new Error('Data is not an array');
    }
  } catch (err) {
    console.error(`Malformed JSON: ${err.message}`);
    return;
  }

  // Edge case: empty array
  if (users.length === 0) {
    console.log('No data to process (empty array).');
    return;
  }

  // Process based on mode
  let result;
  
  if (mode === 'minimal') {
    // Minimal mode: only normalize emails, no splitting names or cities
    const transformed = [];
    for (let user of users) {
      if (user.email) {
        const email = user.email.trim().toLowerCase();
        if (validateEmail(email)) {
          transformed.push({ email });
        }
      }
    }
    result = { transformed, domainCounts: {}, cityCounts: {} };
    // Minimal stats: only domains
    transformed.forEach(u => {
      const domain = u.email.split('@')[1];
    result.domainCounts[domain] = (result.domainCounts[domain] || 0) + 1;
    });
  } 
  
  
  else {
    // Default mode: Full processing with chunks
    result = processUsersInChunks(users);
  }

  
  // Write transformed JSON asynchronously
  fs.writeFile(outputFile, JSON.stringify(result.transformed, null, 2), 'utf8', (err) => {
    if (err) {
      console.error(`Error writing file: ${err.message}`);
    } else {
      console.log(`Transformed data written to ${outputFile}`);
    }
  });


  
  // Generate summary
  const topDomains = getTopItems(result.domainCounts);
  const topCities = getTopItems(result.cityCounts);

  console.log('\nTop Email Domains:');
  topDomains.forEach(([domain, count]) => console.log(`${domain}: ${count}`));

  if (mode !== 'minimal') {
    console.log('\nTop Cities:');
    topCities.forEach(([city, count]) => console.log(`${city}: ${count}`));
  }
}

main();


