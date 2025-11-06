// server/src/utils/__tests__/auth.test.js
const { generateToken, verifyToken, hashPassword, comparePassword } = require('../auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('Auth Utilities', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com'
  };

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const mockToken = 'mock.jwt.token';
      jwt.sign.mockReturnValue(mockToken);

      const token = generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser._id, email: mockUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      expect(token).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const mockToken = 'valid.jwt.token';
      const mockPayload = { userId: mockUser._id };
      
      jwt.verify.mockReturnValue(mockPayload);

      const payload = verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(payload).toEqual(mockPayload);
    });

    it('should throw error for invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyToken('invalid.token')).toThrow('Invalid token');
    });
  });
});