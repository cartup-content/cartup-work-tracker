/**
 * Settings → Team access code: show and change the code the Job desk and Task board ask for
 * (Apps Script property TEAM_CODE, script 2.4.0+). Works only in the unlocked dashboard.
 */
import { useEffect, useState } from 'react';
import { useApp } from '../hooks/AppContext';
import { localAppsScriptUrl } from '../services/appsScriptUrl';
import { isUnlocked } from '../services/dashLock';
import { scriptTeamCode } from '../services/scriptApi';
import { Card } from './ui';

const CODE_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789'; // no look-alikes (l/1, o/0, i)

/** A random code that is easy to read out, e.g. "k7m2-p9xq-4tz8". */
function randomCode(): string {
  const limit = 256 - (256 % CODE_CHARS.length); // skip the bytes that would make some characters more likely
  let chars = '';
  while (chars.length < 12) {
    for (const byte of crypto.getRandomValues(new Uint8Array(16))) {
      if (byte < limit && chars.length < 12) chars += CODE_CHARS[byte % CODE_CHARS.length];
    }
  }
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8)}`;
}

export function TeamCodeCard() {
  const { data } = useApp();
  const url = localAppsScriptUrl() || data.appsScriptUrl || data.governance?.writeUrl || null;
  const unlocked = isUnlocked();
  const [current, setCurrent] = useState<string | null>(null); // null = not read yet; '' = off
  const [shown, setShown] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!url || !unlocked) return;
    scriptTeamCode(url)
      .then(setCurrent)
      .catch((e) => setMessage({ ok: false, text: (e as Error).message }));
  }, [url, unlocked]);

  const save = async () => {
    if (!url || draft.trim().length < 6) return;
    setBusy(true);
    setMessage(null);
    try {
      setCurrent(await scriptTeamCode(url, draft.trim()));
      setDraft('');
      setShown(true);
      setMessage({ ok: true, text: 'Saved. Share the new code with the team — devices that used the old code are asked for the new one.' });
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    }
    setBusy(false);
  };

  const copy = () => {
    if (current) void navigator.clipboard?.writeText(current);
  };

  const isOn = !!current;
  return (
    <Card
      title="Team access code"
      subtitle={
        current === null
          ? 'Job desk and Task board'
          : isOn
            ? 'On · the Job desk and Task board ask for this code once per device'
            : 'Off · the Job desk and Task board are open to anyone with the link'
      }
    >
      <div style={{ fontSize: 13.5, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!unlocked ? (
          <p className="muted" style={{ margin: 0 }}>
            Set a dashboard password first (card above). The team code can only be shown and changed from the unlocked dashboard.
          </p>
        ) : !url ? (
          <p className="muted" style={{ margin: 0 }}>
            Set up the Apps Script first (Connections above).
          </p>
        ) : current === null ? (
          message ? (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--bad)' }}>{message.text}</p>
          ) : (
            <p className="muted" style={{ margin: 0 }}>
              Checking…
            </p>
          )
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`badge ${isOn ? 'good' : 'bad'}`}>{isOn ? 'On' : 'Off'}</span>
              {isOn && (
                <>
                  <code style={{ fontSize: 13 }}>{shown ? current : '•'.repeat(Math.min(current.length, 12))}</code>
                  <button type="button" className="btn btn-sm" onClick={() => setShown((s) => !s)}>
                    {shown ? 'Hide' : 'Show'}
                  </button>
                  <button type="button" className="btn btn-sm" onClick={copy}>
                    Copy
                  </button>
                </>
              )}
            </div>
            <div className="field" style={{ maxWidth: 520 }}>
              <span>{isOn ? 'New code' : 'Code for the team'} (6–64 characters, not the dashboard password)</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <input
                  className="input"
                  style={{ flex: '1 1 200px' }}
                  value={draft}
                  autoComplete="off"
                  placeholder="e.g. k7m2-p9xq-4tz8"
                  aria-label="New team access code"
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button type="button" className="btn btn-sm" onClick={() => setDraft(randomCode())}>
                  Generate
                </button>
                <button type="button" className="btn btn-primary btn-sm" disabled={busy || draft.trim().length < 6} onClick={save}>
                  {busy ? 'Saving…' : isOn ? 'Change code' : 'Turn on'}
                </button>
              </div>
            </div>
            {message && <p style={{ margin: 0, fontSize: 13, color: message.ok ? 'var(--good)' : 'var(--bad)' }}>{message.text}</p>}
            <p className="muted" style={{ margin: 0, fontSize: 12.5 }}>
              Change it when someone leaves the team. This dashboard and devices that remember the dashboard password never need it.
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
