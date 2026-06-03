const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const generateOrderId = () => {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const generateTransactionId = () => {
  return `TXN-${uuidv4()}`;
};

const calculateFee = (amount, feePercentage = 0.01) => {
  return parseFloat((amount * feePercentage).toFixed(2));
};

const calculateTotal = (amount, feePercentage = 0.01) => {
  const fee = calculateFee(amount, feePercentage);
  return parseFloat((amount + fee).toFixed(2));
};

const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

module.exports = {
  generateToken,
  generateOrderId,
  generateTransactionId,
  calculateFee,
  calculateTotal,
  getPaginationParams
};
