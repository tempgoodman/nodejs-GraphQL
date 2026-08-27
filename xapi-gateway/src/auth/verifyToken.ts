// 模擬 JWT 驗證邏輯
export const verifyToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;

  if (authHeader === 'Bearer mock_token_for_user_123') {
    return 'user_123';
  }
  
  if (authHeader === 'Bearer mock_token_for_user_888') {
    return 'user_888';
  }
  return null;
};