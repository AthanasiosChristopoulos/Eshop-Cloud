const { Pool } = require('pg');

// const pool = new Pool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'postgres',
//   password: process.env.DB_PASSWORD || '5409',
//   database: process.env.DB_NAME || 'products',
//   port: process.env.DB_PORT || 5432,
// });

const pool = new Pool({
  host: 'product_db',
  user: 'postgres',
  password: '5409',
  database: 'products',
  port:  5432,
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the database', err);
  } else {
    console.log('Connected to the PostgreSQL database');
    initializeDatabase(); 
  }
});

const initializeDatabase = async () => {
  // Create the table with an additional username column
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      img VARCHAR(255),
      price DECIMAL(10, 2),
      quantity INT,
      username VARCHAR(255)  -- New column for username
    );
  `;

  // Modify the insert data query to alternate the 'username' values between 'a' and 'b'
  const insertDataQuery = `
    INSERT INTO products (title, img, price, quantity, username) 
    VALUES 
      ('keyboard', 'https://media.wired.com/photos/667df9e694f18abc72ad4adb/3:2/w_1600%2Cc_limit/Logitech%2520MX%2520Mechanical%2520Mini%2520for%2520Mac%2520Abstract%2520Background%2520SOURCE%2520Amazon.jpg', 40, 23, 'a'),
      ('earbuds', 'https://assets.rha-audio.com/j0lci/c/TrueControl-thumb.jpg', 60, 5, 'b'),
      ('gamepad', 'https://bbpcdn.pstatic.gr/bpimg52/9FvF2/1SYzV1_SX1200Y630/1728492731/microsoft-xbox-series-wireless-controller-pc-xbox-x-xbox-one-velocity-green-white.jpg', 45, 31, 'a'),
      ('smart watch', 'images/img-5.jpeg', 50, 100, 'b'),
      ('laptop', 'images/img-6.jpg', 1000, 15, 'a'),
      ('USB-Hub', 'images/img-7.jpg', 10, 10, 'b');
  `;

  try {
    // Create the table if it doesn't exist
    await pool.query(createTableQuery);
    console.log('Products table created or already exists.');

    // Check if there is already data in the table
    const { rowCount } = await pool.query('SELECT 1 FROM products LIMIT 1');
    
    if (rowCount === 0) {
      // Insert the initial data with alternating usernames
      await pool.query(insertDataQuery);
      console.log('Initial data inserted.');
    } else {
      console.log('Table already contains data; no initial data inserted.');
    }

  } catch (error) {
    console.error('Error during database initialization', error);
  }
};

module.exports = pool;


//=================================================================================================================
//=================================================================================================================

// const { Pool } = require('pg');

// const pool = new Pool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'postgres',
//   password: process.env.DB_PASSWORD || '5409',
//   database: process.env.DB_NAME || 'products',
//   port: process.env.DB_PORT || 5432,
// });

  
// pool.connect((err) => {
//   if (err) {
//     console.error('Error connecting to the database', err);
//   } else {
//     console.log('Connected to the PostgreSQL database');
//   }
// });

// module.exports = pool