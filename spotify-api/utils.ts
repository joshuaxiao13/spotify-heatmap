export const queryParamsStringify = (url: string, params?: Record<string, string | undefined>): string => {
  if (params) {
    return Object.entries(params).reduce((acc, [key, value]) => acc + key + '=' + value + '&', url + '?');
  }
  return url;
};

export const generateRandomString = (): string => {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let res = '';
  for (let i = 0; i < 32; ++i) {
    res += characters[Math.floor(Math.random() * characters.length)];
  }
  return res;
};
