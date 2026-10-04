#!/usr/bin/env python3
"""Extract public RKI facts; requires pdftotext (Poppler)."""
import hashlib
from pathlib import Path
import re
import subprocess
import sys

source = Path(sys.argv[1])
page = subprocess.check_output(['pdftotext', '-f', '33', '-l', '33', '-layout', str(source), '-'], text=True)
rows = []
for line in page.splitlines():
    match = re.match(r'\s*(\d+,\d+)\s+(Monate|Jahre)\s+(.*)', line)
    if not match:
        continue
    age, unit, cells = match.groups()
    months = float(age.replace(',', '.')) * (12 if unit == 'Jahre' else 1)
    if months > 66:
        continue
    values = [round(float(cell.replace(',', '.')) * 1000) for cell in cells.split()[:7]]
    p10, p50, p90 = values[1], values[3], values[5]
    assert 0 < p10 < p50 < p90
    rows.append(f'  [{int(months)}, {p10}, {p50}, {p90}],')
assert len(rows) == 24
output = '''// RKI: Referenzperzentile, zweite erweiterte Ausgabe (2013), printed p. 31 (PDF p. 33).
// Girls: KiGGS 2003–2006 and German perinatal data 1995–2000.
// Source: https://edoc.rki.de/bitstream/handle/176904/3254/28jWMa04ZjppM.pdf?sequence=
// Retrieved 2026-10-04. PDF SHA-256: ''' + hashlib.sha256(source.read_bytes()).hexdigest() + '''
// [age in months, P10 grams, P50 median grams, P90 grams]. RKI months 1 and 2 are interpolated.
// Reproduce: python3 scripts/extract-kiggs-weight.py /path/to/download.pdf
export const KIGGS_WEIGHT_GIRLS: readonly (readonly [number, number, number, number])[] = [
''' + '\n'.join(rows) + '\n];\n'
Path('src/data/kiggs-weight-girls.ts').write_text(output)
