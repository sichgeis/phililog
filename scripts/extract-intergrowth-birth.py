#!/usr/bin/env python3
"""Öffentliche INTERGROWTH-21st-Tabelle für Mädchen extrahieren; benötigt pdftotext."""
import hashlib
from pathlib import Path
import re
import subprocess
import sys
source = Path(sys.argv[1])
page = subprocess.check_output(['pdftotext', '-layout', str(source), '-'], text=True)
rows = []
for line in page.splitlines():
    match = re.match(r'\s*(\d+)\+(\d)\s+((?:\d+\.\d+\s*){7})\s*$', line)
    if not match:
        continue
    weeks, days, cells = match.groups()
    values = [round(float(cell) * 1000) for cell in cells.split()]
    assert len(values) == 7 and all(a < b for a, b in zip(values, values[1:]))
    rows.append([int(weeks) * 7 + int(days), *values])
assert [row[0] for row in rows] == list(range(33 * 7, 43 * 7))
output = '''// INTERGROWTH-21st, Oxford: Geburtsgewicht Mädchen, 33+0 bis 42+6.
// Quelle: https://media.tghn.org/articles/INTERGROWTH-21st_Birth_Weight_Standards_Girls_1.pdf
// Abgerufen 22.10.2026. SHA-256: ''' + hashlib.sha256(source.read_bytes()).hexdigest() + '''
// Reproduktion: python3 scripts/extract-intergrowth-birth.py /path/to/original.pdf
// [Schwangerschaftsalter in Tagen, P3, P5, P10, P50, P90, P95, P97 in Gramm].
export const BIRTH_WEIGHT_GIRLS: readonly (readonly number[])[] = [
''' + '\n'.join('  [' + ', '.join(map(str, row)) + '],' for row in rows) + '\n];\n'
Path('src/data/intergrowth-birth-girls.ts').write_text(output)
