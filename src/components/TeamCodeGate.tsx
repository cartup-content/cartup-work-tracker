/**
 * Team access code screen for the Job desk and Task board. Shown only when the Apps Script asks for
 * the code (Script Property TEAM_CODE is set and this device has no valid code). Without TEAM_CODE
 * the pages open as before.
 */
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { onTeamCodeNeeded, saveTeamCode, type TeamCodeError } from '../services/teamCode';
import { BuiltBy } from './BuiltBy';

export function TeamCodeGate({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<TeamCodeError | null>(null);
  const [code, setCode] = useState('');
  const [remember, setRemember] = useState(true);

  useEffect(() => onTeamCodeNeeded(setRequest), []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    saveTeamCode(code, remember);
    window.location.reload(); // every list on the page loads again with the code
  };

  return (
    <>
      {children}
      {request && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', padding: 16, background: 'var(--bg)' }}>
          <form
            onSubmit={submit}
            style={{ width: '100%', maxWidth: 360, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span aria-hidden="true" style={{ fontSize: 22 }}>
                🔒
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>Cartup Content Work Tracker</div>
                <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>Enter the team access code</div>
              </div>
            </div>
            <input
              className="input"
              type="password"
              autoFocus
              autoComplete="off"
              aria-label="Team access code"
              placeholder="Team access code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--ink-2)' }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember on this device
            </label>
            <div style={{ color: request.isWrong ? 'var(--bad)' : 'var(--ink-3)', fontSize: 13 }}>{request.message}</div>
            <button type="submit" className="btn btn-primary" disabled={!code.trim()}>
              Continue
            </button>
            <BuiltBy />
          </form>
        </div>
      )}
    </>
  );
}
