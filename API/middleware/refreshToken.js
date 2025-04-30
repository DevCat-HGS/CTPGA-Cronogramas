const jwt = require('jsonwebtoken');

const refreshToken = async (req, res) => {
  try {
    // Obtener el token actual
    const oldToken = req.body.token || req.header('x-auth-token');

    if (!oldToken) {
      return res.status(401).json({ msg: 'No hay token, autorización denegada' });
    }

    try {
      // Verificar el token actual
      const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
      
      // Crear nuevo token con la misma información
      const payload = {
        user: decoded.user
      };

      // Firmar nuevo token
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.json({ token });
    } catch (err) {
      res.status(401).json({ msg: 'Token no válido' });
    }
  } catch (err) {
    console.error('Error en refreshToken:', err.message);
    res.status(500).send('Error del servidor');
  }
};

module.exports = refreshToken;