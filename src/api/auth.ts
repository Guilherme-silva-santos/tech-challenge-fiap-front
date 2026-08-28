import api from '@/lib/axios';
import type { TokenPair } from '@/types';

export const authApi = {
  login: (email: string, senha: string) =>
    api.post<TokenPair>('/auth/login', { email, senha }).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<TokenPair>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: () => api.post('/auth/logout'),
};
