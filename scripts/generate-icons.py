"""Generate the code-designed PWA monogram without external image dependencies."""
from pathlib import Path
import struct
import zlib

def chunk(kind, data):
    return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))

def color(x, y):
    green, cream, gold = (75, 87, 154), (255, 254, 253), (131, 206, 217)
    if (x-92)**2 + (y-32)**2 <= 7**2:
        return gold
    outer = 42 <= x <= 64 and 36 <= y <= 100 or (x-65)**2+(y-61)**2 <= 25**2
    inner = 57 <= x <= 67 and 51 <= y <= 71 or (x-67)**2+(y-61)**2 <= 10**2
    return cream if outer and not inner else green

for size, name in [(192, 'icon-192.png'), (512, 'icon-512.png'), (180, 'apple-touch-icon.png')]:
    rows = bytearray()
    for y in range(size):
        rows.append(0)
        for x in range(size):
            samples = [color((x+dx)*128/size, (y+dy)*128/size) for dx in (.25,.75) for dy in (.25,.75)]
            rows.extend(round(sum(c[i] for c in samples)/4) for i in range(3))
    data = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR',struct.pack('>IIBBBBB',size,size,8,2,0,0,0)) + chunk(b'IDAT', zlib.compress(rows)) + chunk(b'IEND',b'')
    Path('public', name).write_bytes(data)
print('PWA-Symbole erstellt.')
