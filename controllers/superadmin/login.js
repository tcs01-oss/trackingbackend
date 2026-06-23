const pool = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, user_type FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];

    if (user.user_type && user.user_type !== 'super_admin')
      return res.status(403).json({ error: 'Forbidden' });

    let ok = false;
    if (user.password && String(user.password).startsWith('$2')) {
      ok = await bcrypt.compare(password, user.password);
    } else if (user.password) {
      ok = password === user.password;
    }

    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // generate token
    const token = jwt.sign(
      {
        id: user.id,
        role: 'super_admin',
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'super_admin'
      }
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: 'Server error',
      details: String(e.message || e)
    });
  }
}




module.exports = {
  login,
 
};
