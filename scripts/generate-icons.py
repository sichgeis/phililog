"""Render public/icon.svg through Browser-Harness. Requires local Vite on port 5173."""
import subprocess
subprocess.run(['browser-harness'], input='''
import base64, time
from pathlib import Path
new_tab('http://127.0.0.1:5173/icon.svg')
wait_for_load()
for size, name in [(192, 'icon-io-192.png'), (512, 'icon-io-512.png'), (180, 'apple-touch-icon-io.png')]:
    cdp('Emulation.setDeviceMetricsOverride', width=size, height=size, deviceScaleFactor=1, mobile=False)
    time.sleep(.3)
    Path('public', name).write_bytes(base64.b64decode(cdp('Page.captureScreenshot')['data']))
cdp('Emulation.clearDeviceMetricsOverride')
''', text=True, check=True)
print('Io-Icons aus public/icon.svg gerendert.')
