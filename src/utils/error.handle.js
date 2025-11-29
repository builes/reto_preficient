/**
 * Manejador centralizado de errores
 * @param {Object} res - Objeto de respuesta de Express
 * @param {String} message - Mensaje de error para el cliente
 * @param {Error} error - Objeto de error original
 */
export const errorHandler = (res, message = 'Server error', error) => {
  console.error(error);
  res.status(500).json({ message });
};
