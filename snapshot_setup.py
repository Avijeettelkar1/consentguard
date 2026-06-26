"""
Builds a Daytona snapshot with Playwright pre-installed.
Run this once to get the DAYTONA_SNAPSHOT value for backend/.env.
"""
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
from dotenv import load_dotenv
load_dotenv("backend/.env")

from daytona_sdk import Daytona, CreateSnapshotParams, Image

daytona = Daytona()

image = (
    Image.debian_slim("3.12")
    .pip_install(["playwright", "requests"])
    .run_commands(
        "playwright install chromium",
        "playwright install-deps chromium",
    )
)

print("Building snapshot... (takes 3-5 minutes)")
snapshot = daytona.snapshot.create(
    CreateSnapshotParams(name="consentguard-playwright", image=image),
    on_logs=lambda chunk: print(chunk),
)

print("\nSNAPSHOT READY")
print(f"Snapshot name: {snapshot.name}")
print(f"\nAdd this to backend/.env:")
print(f"DAYTONA_SNAPSHOT={snapshot.name}")
