import { createContext, useContext, useEffect, useState } from 'react';
import { useApolloClient, useLazyQuery } from '@apollo/client';
import { ME_QUERY } from '../graphql/queries';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const apollo = useApolloClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchMe] = useLazyQuery(ME_QUERY, { fetchPolicy: 'network-only' });

  useEffect(() => {
    const token = localStorage.getItem('civiccase_token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(({ data }) => {
        if (data?.me) setUser(data.me);
      })
      .finally(() => setLoading(false));
  }, [fetchMe]);

  const login = (token, user) => {
    localStorage.setItem('civiccase_token', token);
    setUser(user);
  };

  const logout = async () => {
    localStorage.removeItem('civiccase_token');
    setUser(null);
    await apollo.resetStore();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
