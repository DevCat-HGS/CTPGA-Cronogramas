const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Obtener token del header
  const token = req.header('x-auth-token');

  // Verificar si no hay token
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar usuario al request
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token no válido' });
  }
};