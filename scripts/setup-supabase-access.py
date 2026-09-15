#!/usr/bin/env python3
"""Store a user-entered Supabase PAT outside Git; verify access without family data."""
import getpass
import json
import os
from pathlib import Path
import sys
import tempfile
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

PROJECT = 'aiyjwwbdfjtflehtvedt'
TOKEN_FILE = Path.home() / '.config' / 'phililog' / 'supabase-access-token'


def check_access(token):
    request = Request(
        f'https://api.supabase.com/v1/projects/{PROJECT}/database/query',
        data=json.dumps({'query': 'select 1 as access_ok;', 'read_only': True}).encode(),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urlopen(request, timeout=30) as response:
            result = json.load(response)
    except HTTPError as error:
        raise RuntimeError(f'API-Zugang fehlgeschlagen (HTTP {error.code}). Token, Projektfreigabe und Database-Leserecht prüfen.') from None
    except (URLError, TimeoutError):
        raise RuntimeError('Supabase nicht erreichbar. Verbindung prüfen; Token wurde nicht gespeichert.') from None
    if result != [{'access_ok': 1}]:
        raise RuntimeError('Unerwartete API-Antwort. Token wurde nicht gespeichert.')


def main():
    if len(sys.argv) > 1:
        if sys.argv[1:] != ['--check']:
            raise RuntimeError('Aufruf: python3 scripts/setup-supabase-access.py [--check]')
        if TOKEN_FILE.is_symlink() or not TOKEN_FILE.is_file() or TOKEN_FILE.stat().st_mode & 0o077:
            raise RuntimeError('Token-Datei muss eine reguläre Datei mit Rechten 0600 sein.')
        check_access(TOKEN_FILE.read_text().strip())
        print('Management-API-Zugang zu Philine-Log bestätigt (nur SELECT 1).')
        return
    if not sys.stdin.isatty():
        raise RuntimeError('Bitte in einem interaktiven Terminal starten; keine Token-Eingabe über Chat oder Kommandozeilenargumente.')
    token = getpass.getpass('Supabase Personal Access Token (Eingabe unsichtbar): ').strip()
    if not token.startswith('sbp_') or any(c.isspace() for c in token):
        raise RuntimeError('Bitte einen Supabase Personal Access Token eingeben, keinen App-API-Key.')
    check_access(token)
    directory = TOKEN_FILE.parent
    if directory.is_symlink():
        raise RuntimeError('Das Token-Verzeichnis darf kein symbolischer Link sein.')
    directory.mkdir(mode=0o700, parents=True, exist_ok=True)
    directory.chmod(0o700)
    temporary = None
    try:
        fd, temporary = tempfile.mkstemp(prefix='.supabase-token-', dir=directory)
        with os.fdopen(fd, 'w') as handle:
            handle.write(token + '\n')
        os.replace(temporary, TOKEN_FILE)
    finally:
        if temporary and Path(temporary).exists():
            Path(temporary).unlink()
    print('Zugang geprüft und außerhalb des Repositories mit Dateirechten 0600 gespeichert.')
    print(f'Ablage: {TOKEN_FILE}')
    print('Der Lesetest bestätigt noch keine Schreibrechte; diese werden bei der freigegebenen Migration geprüft.')


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, OSError, ValueError) as error:
        print(f'Einrichtung: {error}', file=sys.stderr)
        sys.exit(1)
    except (KeyboardInterrupt, EOFError):
        print('\nEinrichtung abgebrochen; vorhandener Token bleibt erhalten.', file=sys.stderr)
        sys.exit(1)
