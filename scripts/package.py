#!/usr/bin/env python3
"""Build the same deterministic, explicit-allowlist ZIP used by the market."""
import hashlib
import json
import stat
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = ('manifest.json', 'index.js', 'provider-support.json', 'LICENSE',
         'README.md', 'docs/RESEARCH-20261030.md')

def main():
    manifest = json.loads((ROOT / 'manifest.json').read_bytes())
    out = ROOT / 'dist' / f"aide-pkg-{manifest['id']}-v{manifest['version']}.zip"
    out.parent.mkdir(exist_ok=True)
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name in FILES:
            source = ROOT / name
            if source.is_symlink() or not source.is_file():
                raise SystemExit(f'Invalid package input: {name}')
            entry = zipfile.ZipInfo(name, (2026, 10, 30, 0, 0, 0))
            entry.create_system = 3
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, source.read_bytes())
    with zipfile.ZipFile(out) as archive:
        assert sorted(archive.namelist()) == sorted(FILES)
        assert archive.testzip() is None
        for entry in archive.infolist():
            assert archive.read(entry.filename) == (ROOT / entry.filename).read_bytes()
            assert stat.S_ISREG(entry.external_attr >> 16)
            assert stat.S_IMODE(entry.external_attr >> 16) == 0o644
    digest = hashlib.sha256(out.read_bytes()).hexdigest()
    (out.parent / 'SHA256SUMS').write_text(f'{digest}  {out.name}\n')
    print(json.dumps({'path': str(out), 'bytes': out.stat().st_size, 'sha256': digest}))

if __name__ == '__main__':
    main()
