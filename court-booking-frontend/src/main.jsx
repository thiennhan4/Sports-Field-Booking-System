// src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './app/queryClient'
import { router } from './app/router'
import { SettingsProvider } from './contexts/SettingsContext'
import './index.css'

// Apply saved theme before React renders to avoid flash
const savedDarkMode = localStorage.getItem('darkMode') !== 'false';
document.documentElement.dataset.theme = savedDarkMode ? 'dark' : 'light';
document.documentElement.classList.toggle('dark', savedDarkMode);
document.documentElement.classList.toggle('light', !savedDarkMode);
document.documentElement.lang = localStorage.getItem('language') || 'vi';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </QueryClientProvider>
  </StrictMode>,
)
