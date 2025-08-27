import { createRoot } from 'react-dom/client'
import './app.css'
import './shared/styles/mobile-scroll.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router";
import { AuthProvider } from './shared/context/auth/AuthContext.tsx';
import { SyncProvider } from './shared/context/sync/SyncProvider.tsx';
import { Toaster } from 'react-hot-toast';
import UpdateManager from './shared/components/commons/UpdateManager.tsx';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <SyncProvider>
      <UpdateManager />
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            fontWeight: '600',
          },
          success: {
            iconTheme: { primary: 'var(--color-primary-dark)', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: 'white' },
          },
          custom: {
            iconTheme: { primary: '#f59e0b', secondary: 'white' },
          }
        }}
      />
    </SyncProvider>
  </AuthProvider>
)