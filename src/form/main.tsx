import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TaskForm } from './TaskForm';
import { TeamCodeGate } from '../components/TeamCodeGate';
import '../styles/global.css';
import './form.css';

try {
  const theme = JSON.parse(localStorage.getItem('cartup.theme') ?? '"system"');
  if (theme === 'light' || theme === 'dark') document.documentElement.setAttribute('data-theme', theme);
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TeamCodeGate>
      <TaskForm />
    </TeamCodeGate>
  </StrictMode>,
);
