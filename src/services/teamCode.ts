/**
 * Team access code for the Job desk and Task board (Apps Script property TEAM_CODE, script 2.3.0+).
 * The script answers TEAM_CODE_NEEDED / TEAM_CODE_WRONG when it wants the code; the pages then ask
 * for it once (TeamCodeGate) and keep it on this device.
 */
const STORE = 'cartup.teamCode';
const NEEDED = 'TEAM_CODE_NEEDED:';
const WRONG = 'TEAM_CODE_WRONG:';

export function teamCode(): string | null {
  try {
    return sessionStorage.getItem(STORE) ?? localStorage.getItem(STORE);
  } catch {
    return null;
  }
}

export function saveTeamCode(code: string, remember: boolean) {
  try {
    forgetTeamCode();
    (remember ? localStorage : sessionStorage).setItem(STORE, code.trim());
  } catch {
    /* private window: the code is asked again next time */
  }
}

export function forgetTeamCode() {
  try {
    localStorage.removeItem(STORE);
    sessionStorage.removeItem(STORE);
  } catch {
    /* ignore */
  }
}

/** The script refused the request until the team access code is given. */
export class TeamCodeError extends Error {
  constructor(
    message: string,
    readonly isWrong: boolean,
  ) {
    super(message);
  }
}

const listeners = new Set<(e: TeamCodeError) => void>();

/** TeamCodeGate listens here to show the code screen. Returns the unsubscribe function. */
export function onTeamCodeNeeded(listener: (e: TeamCodeError) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** A TeamCodeError when the script's error text asks for the team code (also forgets a wrong code), else null. */
export function teamCodeError(scriptError: string | undefined): TeamCodeError | null {
  const text = scriptError ?? '';
  const isWrong = text.startsWith(WRONG);
  if (!isWrong && !text.startsWith(NEEDED)) return null;
  if (isWrong) forgetTeamCode();
  const error = new TeamCodeError(text.slice((isWrong ? WRONG : NEEDED).length).trim(), isWrong);
  listeners.forEach((listener) => listener(error));
  return error;
}
