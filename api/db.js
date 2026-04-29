const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://vibelearn_user:vibelearn_pass@localhost:5432/vibelearn_db',
});

module.exports = pool;
