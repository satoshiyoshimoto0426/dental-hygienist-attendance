import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  extractTokenFromHeader,
  JWTPayload
} from '../auth';

describe('Auth Utils', () => {
  const mockPayload: JWTPayload = {
    userId: 1,
    username: 'testuser',
    role: 'user',
    hygienistId: 1
  };

  describe('generateToken', () => {
    it('JWTトークンを生成できること', () => {
      const token = generateToken(mockPayload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('verifyToken', () => {
    it('有効なトークンを検証できること', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.username).toBe(mockPayload.username);
      expect(decoded.role).toBe(mockPayload.role);
      expect(decoded.hygienistId).toBe(mockPayload.hygienistId);
    });

    it('無効なトークンでエラーが発生すること', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow('Invalid token');
    });
  });

  describe('hashPassword', () => {
    it('パスワードをハッシュ化できること', async () => {
      const password = 'testpassword';
      const hash = await hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('comparePassword', () => {
    it('正しいパスワードで検証が成功すること', async () => {
      const password = 'testpassword';
      const hash = await hashPassword(password);
      
      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('間違ったパスワードで検証が失敗すること', async () => {
      const password = 'testpassword';
      const wrongPassword = 'wrongpassword';
      const hash = await hashPassword(password);
      
      const isValid = await comparePassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('正しいAuthorizationヘッダーからトークンを抽出できること', () => {
      const token = 'test-token';
      const header = `Bearer ${token}`;
      
      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('Authorizationヘッダーがない場合はnullを返すこと', () => {
      const extracted = extractTokenFromHeader(undefined);
      expect(extracted).toBeNull();
    });

    it('不正な形式のヘッダーの場合はnullを返すこと', () => {
      const extracted = extractTokenFromHeader('Invalid header');
      expect(extracted).toBeNull();
    });

    it('Bearerでない場合はnullを返すこと', () => {
      const extracted = extractTokenFromHeader('Basic token');
      expect(extracted).toBeNull();
    });
  });
});