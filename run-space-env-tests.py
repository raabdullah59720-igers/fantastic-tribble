#!/usr/bin/env python3
"""Run local static QA and deterministic space-environment calculation tests."""
from pathlib import Path
import subprocess, sys
ROOT = Path(__file__).resolve().parent
commands = [
    [sys.executable, str(ROOT / 'run-static-qa.py')],
    ['node', str(ROOT / 'tests' / 'test-space-environment.cjs')],
    ['node', str(ROOT / 'tests' / 'test-pwa-omnibox.cjs')],
    ['node', str(ROOT / 'tests' / 'test-rf-interference-intelligence.cjs')],
]
for command in commands:
    print('\n>', ' '.join(command), flush=True)
    result = subprocess.run(command, cwd=ROOT)
    if result.returncode:
        print('FAILED:', ' '.join(command))
        raise SystemExit(result.returncode)
print('\nTERRAVEX space environment QA suite: PASS')
