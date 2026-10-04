#!/usr/bin/env python3
"""Öffentliche WHO-Referenzen extrahieren; Verzeichnis enthält die Originaldateien.
python3 scripts/extract-who-growth.py /tmp
Dateinamen: phililog-who-percentiles.xlsx, phililog-length.xlsx,
phililog-velocity-{1,2,3,4,6}.xlsx, phililog-velocity-birth.pdf. Poppler erforderlich.
"""
import hashlib,json,re,subprocess,sys,zipfile
from pathlib import Path
import xml.etree.ElementTree as E
root=Path(sys.argv[1]);ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def rows(name):
 with zipfile.ZipFile(root/name) as z:
  strings=[''.join(x.itertext()) for x in E.fromstring(z.read('xl/sharedStrings.xml'))] if 'xl/sharedStrings.xml' in z.namelist() else []
  result=[]
  for row in E.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('m:sheetData/m:row',ns):
   cells=[]
   for c in row:
    v=c.find('m:v',ns)
    if v is None:cells.append(''.join(c.itertext()))
    elif c.attrib.get('t')=='s':cells.append(strings[int(v.text)])
    else:cells.append(float(v.text))
   result.append(cells)
  return result
sources={
'phililog-who-percentiles.xlsx':'https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-for-age/expanded-tables/wfa-girls-percentiles-expanded-tables.xlsx?sfvrsn=54cfa5e8_9',
'phililog-length.xlsx':'https://www.who.int/tools/child-growth-standards/standards/weight-for-length-height',
'phililog-velocity-birth.pdf':'https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-velocity/weight_inc_birth_to_60_days_girls.pdf?sfvrsn=8ecfc50f_15'}
for duration in [1,2,3,4,6]:sources[f'phililog-velocity-{duration}.xlsx']='https://www.who.int/tools/child-growth-standards/standards/weight-velocity'
header='// WHO Child Growth Standards · Mädchen. Extrahiert 2026-10-04.\n// Reproduktion: python3 scripts/extract-who-growth.py /path/to/original-files\n'
for name,url in sources.items():header+=f'// {name}: {url}\n// SHA-256: {hashlib.sha256((root/name).read_bytes()).hexdigest()}\n'
def export(name,data):return 'export const '+name+' = '+json.dumps(data,separators=(',',':'))+' as const;\n'
wfa=rows('phililog-who-percentiles.xlsx')[1:];assert len(wfa)==1857
assert all(r[0]==i and r[2]>0 and r[3]>0 for i,r in enumerate(wfa))
wfl=rows('phililog-length.xlsx')[1:];assert len(wfl)==131 and wfl[0][0]==45 and wfl[-1][0]==110
output=header+'// LMS: M in kg. Altersindex in Tagen. Länge: [cm,L,M,S], Stützabstand 0,5 cm.\n'
output+=export('WHO_WEIGHT_LMS', [r[1:4] for r in wfa])+export('WHO_LENGTH_LMS',[r[:4] for r in wfl])
velocity=[]
def endpoint(text):
 m=re.fullmatch(r'(\d+)\s*(wks|mo)?',text.strip());assert m,text
 value=int(m[1]);return {'unit':'days','age':value*7} if m[2]=='wks' else {'unit':'months','age':value}
for duration in [1,2,3,4,6]:
 data=rows(f'phililog-velocity-{duration}.xlsx');columns=[(i,int(re.match(r'\d+',str(v))[0])) for i,v in enumerate(data[0]) if re.match(r'^\d+(st|nd|rd|th)',str(v))]
 for row in data[1:]:
  label=row[0];parts=re.split(r'\s*[–-]\s*',label);assert len(parts)==2,label
  # The right-hand suffix also applies to an unsuffixed left endpoint.
  if not re.search(r'(wks|mo)',parts[0]):parts[0]+=' '+re.search(r'(wks|mo)',parts[1])[0]
  velocity.append({'label':label,'start':endpoint(parts[0]),'end':endpoint(parts[1]),'centiles':[[p,int(row[i])] for i,p in columns]})
output+=export('WHO_VELOCITY',velocity)
page=subprocess.check_output(['pdftotext','-layout',str(root/'phililog-velocity-birth.pdf'),'-'],text=True)
birth=[];current=None
for line in page.splitlines():
 m=re.match(r'\s*(\d+)-(\d+)\s+Median\s+(.*)',line)
 if m:
  current={'start':int(m[1]),'end':int(m[2]),'median':[int(v) for v in m[3].split()[:5]]};birth.append(current)
 elif current:
  m=re.match(r'\s*(25th|10th|5th|\(n\))\s+(.*)',line)
  if m:current[{'25th':'p25','10th':'p10','5th':'p5','(n)':'n'}[m[1]]]=[None if v=='-*' else int(v.strip('()')) for v in m[2].split()[:5]]
assert len(birth)==5 and all(len(r['n'])==5 for r in birth)
output+=export('WHO_BIRTH_VELOCITY',birth)
Path('src/data/who-growth-girls.ts').write_text(output)
print('WHO: 1857 Tages-LMS, 131 Längen-LMS,',len(velocity),'Monatsintervalle und 5 Geburtsgewichtsintervalle.')
