import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AssignForm } from './AssignForm';
import { TeamCodeGate } from '../components/TeamCodeGate';
import '../styles/global.css';
import '../form/form.css';
import './assign.css';

try {
  const theme = JSON.parse(localStorage.getItem('cartup.theme') ?? '"system"');
  if (theme === 'light' || theme === 'dark') document.documentElement.setAttribute('data-theme', theme);
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TeamCodeGate>
      <AssignForm />
    </TeamCodeGate>
  </StrictMode>,
);
