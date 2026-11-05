'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { getCurrentUserSessionAction, logoutUserAction } from '@/app/actions/auth';
import { checkUserPermission, checkUserAnyPermission, parsePermissions } from '@/lib/rbac';

// ایجاد کانتکست سراسری برای جلوگیری از درخواست‌های تکراری به سرور
const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  // تابع دریافت و بروزرسانی وضعیت کاربر از سرور
  const refreshAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCurrentUserSessionAction();
      if (res?.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialUser) {
      refreshAuth();
    }
  }, [initialUser, refreshAuth]);

  // تابع خروج از حساب کاربری
  const logout = useCallback(async () => {
    await logoutUserAction();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  // بررسی داشتن یک تیک خاص در چک‌لیست مدیریتی
  const can = useCallback((permissionId) => {
    return checkUserPermission(user, permissionId);
  }, [user]);

  // بررسی داشتن حداقل یکی از تیک‌های لیست‌شده
  const canAny = useCallback((permissionIds = []) => {
    return checkUserAnyPermission(user, permissionIds);
  }, [user]);

  const value = {
    user,
    loading,
    isLoggedIn: !!user && user.status === 'ACTIVE',
    isAdmin: !!user && (user.isSuperAdmin || user.isAdmin),
    isSuperAdmin: !!user && !!user.isSuperAdmin,
    permissions: user?.isSuperAdmin ? ['*'] : parsePermissions(user?.adminPermissions),
    can,
    canAny,
    refreshAuth,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// هوک اختصاصی برای استفاده آسان در تمام کامپوننت‌ها
export function useAuth() {
  const context = useContext(AuthContext);
  
  // اگر کامپوننتی بیرون از AuthProvider بود، به صورت مستقل هم کار کند و ارور ندهد
  const [standaloneUser, setStandaloneUser] = useState(null);
  const [standaloneLoading, setStandaloneLoading] = useState(true);

  const fetchStandalone = useCallback(async () => {
    try {
      setStandaloneLoading(true);
      const res = await getCurrentUserSessionAction();
      if (res?.success && res.user) {
        setStandaloneUser(res.user);
      } else {
        setStandaloneUser(null);
      }
    } catch {
      setStandaloneUser(null);
    } finally {
      setStandaloneLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!context) {
      fetchStandalone();
    }
  }, [context, fetchStandalone]);

  if (context) return context;

  return {
    user: standaloneUser,
    loading: standaloneLoading,
    isLoggedIn: !!standaloneUser && standaloneUser.status === 'ACTIVE',
    isAdmin: !!standaloneUser && (standaloneUser.isSuperAdmin || standaloneUser.isAdmin),
    isSuperAdmin: !!standaloneUser && !!standaloneUser.isSuperAdmin,
    permissions: standaloneUser?.isSuperAdmin ? ['*'] : parsePermissions(standaloneUser?.adminPermissions),
    can: (permId) => checkUserPermission(standaloneUser, permId),
    canAny: (permIds) => checkUserAnyPermission(standaloneUser, permIds),
    refreshAuth: fetchStandalone,
    logout: async () => {
      await logoutUserAction();
      setStandaloneUser(null);
      if (typeof window !== 'undefined') window.location.href = '/';
    }
  };
}