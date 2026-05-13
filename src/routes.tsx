import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import HomePage from './pages/index';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import DashboardPage from './pages/dashboard';
import AdminPage from './pages/admin';
import DocsPage from './pages/docs';

const NotFoundPage = lazy(() =>
  import('./pages/_404').catch(() => ({ default: () => null as any }))
);

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signin', element: <LoginPage /> },
  { path: '/sign-in', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/signup', element: <RegisterPage /> },
  { path: '/sign-up', element: <RegisterPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/admin', element: <AdminPage /> },
  { path: '/docs', element: <DocsPage /> },
  { path: '*', element: <NotFoundPage /> },
];

export type Path =
  | '/'
  | '/login'
  | '/signin'
  | '/sign-in'
  | '/register'
  | '/signup'
  | '/sign-up'
  | '/dashboard'
  | '/admin'
  | '/docs';
export type Params = Record<string, string | undefined>;
