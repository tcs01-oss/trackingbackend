const pool = require('../../config/database');
const bcrypt = require('bcryptjs');

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  // Default name if not provided
  const userName = name || 'Admin';

  try {
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    // We explicitly set user_type to 'super_admin'
    // We need to ensure the user_type column exists (handled by schema update script)
    
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)',
      [userName, email, hashedPassword, 'super_admin']
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });

  } catch (e) {
    console.error(e);
    // If column doesn't exist, we might get an error here too.
    res.status(500).json({ error: 'Server error', details: e.message });
  }
}

module.exports = { register };
