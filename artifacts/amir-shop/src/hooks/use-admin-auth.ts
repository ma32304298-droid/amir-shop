import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function useAdminAuth() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const isAuth = localStorage.getItem('amir_admin_auth');
    if (isAuth !== 'true') {
      setLocation('/admin');
    }
  }, [location, setLocation]);

  const login = (password: string) => {
    if (password === 'admin123') {
      localStorage.setItem('amir_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('amir_admin_auth');
    setLocation('/admin');
  };

  return { login, logout };
}
