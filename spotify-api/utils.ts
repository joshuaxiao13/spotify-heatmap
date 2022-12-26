export const queryParamsStringify = (params: Record<string, string | undefined>): string => {
  return Object.entries(params)
    .map(([key, value]) => key + '=' + value)
    .join('&');
};

export const generateRandomString = (): string => {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let res = '';
  for (let i = 0; i < 32; ++i) {
    res += characters[Math.floor(Math.random() * characters.length)];
  }
  return res;
};
