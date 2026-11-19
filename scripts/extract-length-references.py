#!/usr/bin/env python3
"""Extract factual centiles from the official WHO XLSX and RKI PDF (Poppler required)."""
import hashlib
from pathlib import Path
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from zipfile import ZipFile

who, kiggs = map(Path, sys.argv[1:])
with ZipFile(who) as workbook:
    sheet = ET.fromstring(workbook.read('xl/worksheets/sheet1.xml'))
who_rows = []
for day, row in enumerate(sheet.findall('.//{*}row')[1:]):
    age, shape, median, spread = [float(cell.findtext('{*}v')) for cell in list(row)[:4]]
    assert day == age and shape == 1 and median > 0 and spread > 0
    who_rows.append(f'  [{median:.4f}, {spread:.5f}],')
assert len(who_rows) == 1857

page = subprocess.check_output(['pdftotext', '-f', '23', '-l', '23', '-layout', str(kiggs), '-'], text=True)
rki_rows = []
for age, unit, cells in re.findall(r'^\s*(\d+,\d+)\s+(Monate|Jahre)\s+([^\n]+)', page, re.M):
    months = float(age.replace(',', '.')) * (12 if unit == 'Jahre' else 1)
    if months > 66:
        continue
    values = [float(cell.replace(',', '.')) for cell in cells.split()[:7]]
    assert len(values) == 7 and all(a < b for a, b in zip(values, values[1:]))
    rki_rows.append(f'  [{int(months)}, {", ".join(f"{value:.2f}" for value in values)}],')
assert len(rki_rows) == 24 and rki_rows[0].startswith('  [0, 47.17, 48.49, 49.82, 51.32,')

who_hash = hashlib.sha256(who.read_bytes()).hexdigest()
rki_hash = hashlib.sha256(kiggs.read_bytes()).hexdigest()
Path('src/data/length-girls.ts').write_text(f'''// Reproduce: python3 scripts/extract-length-references.py WHO.xlsx RKI.pdf
// WHO expanded length/height-for-age z-score tables for girls (L = 1 throughout).
// https://www.who.int/tools/child-growth-standards/standards/length-height-for-age
// XLSX SHA-256: {who_hash}
// Indexed by age in days. [Median cm, S] · recumbent through day 730, standing from day 731.
export const WHO_LENGTH_FOR_AGE: readonly (readonly [number, number])[] = [
{chr(10).join(who_rows)}
];

// RKI (2013), printed p. 21 (PDF p. 23), KiGGS 2003–2006 and perinatal data 1995–2000.
// https://edoc.rki.de/handle/176904/3254
// PDF SHA-256: {rki_hash}
// [Age in months, P3, P10, P25, P50, P75, P90, P97 in cm].
export const KIGGS_LENGTH_CENTILES: readonly (readonly number[])[] = [
{chr(10).join(rki_rows)}
];
''')
