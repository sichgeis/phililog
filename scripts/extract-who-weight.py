#!/usr/bin/env python3
"""Extract public WHO reference facts from the official expanded percentile XLSX."""
import hashlib
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
import zipfile

source = Path(sys.argv[1])
ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(source) as archive:
    rows = ET.fromstring(archive.read('xl/worksheets/sheet1.xml')).findall('m:sheetData/m:row', ns)[1:]
    values = []
    for index, row in enumerate(rows):
        cells = {''.join(filter(str.isalpha, c.attrib['r'])): float(c.find('m:v', ns).text) for c in row if c.find('m:v', ns) is not None}
        assert cells['A'] == index
        p10, p50, p90 = (round(cells[c] * 1000) for c in ['I', 'L', 'O'])
        assert 0 < p10 < p50 < p90
        values.append(f'  [{p10}, {p50}, {p90}],')
assert len(values) == 1857
output = '''// WHO Child Growth Standards: weight-for-age, girls, days 0–1856.
// Source: https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-for-age/expanded-tables/wfa-girls-percentiles-expanded-tables.xlsx?sfvrsn=54cfa5e8_9
// Retrieved 2026-10-04. XLSX SHA-256: ''' + hashlib.sha256(source.read_bytes()).hexdigest() + '''
// Derived public reference values in grams: [P10, P50 (median), P90]. Index = age in days.
// Reproduce: python3 scripts/extract-who-weight.py /path/to/download.xlsx
export const WHO_WEIGHT_GIRLS: readonly (readonly [number, number, number])[] = [
''' + '\n'.join(values) + '\n];\n'
Path('src/data/who-weight-girls.ts').write_text(output)
