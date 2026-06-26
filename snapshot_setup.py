import os
from pathlib import Path

from dotenv import load_dotenv
from daytona_sdk import CreateSnapshotParams, Daytona, Image

SNAPSHOT_NAME = "cg-playwright-v2"
ENV_PATH = Path("backend/.env")


def main() -> None:
    load_dotenv(ENV_PATH)
    if not os.getenv("DAYTONA_API_KEY", "").strip():
        raise SystemExit("DAYTONA_API_KEY is missing in backend/.env")

    daytona = Daytona()

    try:
        snapshot = daytona.snapshot.get(SNAPSHOT_NAME)
        print(f"Reusing existing snapshot: {snapshot.name} ({snapshot.id})")
        print(f"DAYTONA_SNAPSHOT={snapshot.id}")
        _update_env(snapshot.id)
        return
    except Exception:
        pass

    image = (
        Image.debian_slim("3.12")
        .pip_install(["playwright", "requests"])
        .run_commands([
            "playwright install chromium",
            "playwright install-deps chromium",
        ])
    )

    print("Building Daytona snapshot with Playwright + Chromium. This can take a few minutes.")
    snapshot = daytona.snapshot.create(
        CreateSnapshotParams(name=SNAPSHOT_NAME, image=image),
        on_logs=lambda line: print(line),
        timeout=0,
    )

    print("\nSNAPSHOT READY")
    print(f"Name: {snapshot.name}")
    print(f"ID: {snapshot.id}")
    print(f"DAYTONA_SNAPSHOT={snapshot.id}")
    _update_env(snapshot.id)


def _update_env(snapshot_id: str) -> None:
    lines = ENV_PATH.read_text(encoding="utf-8").splitlines()
    updated = False
    new_lines = []
    for line in lines:
        if line.startswith("DAYTONA_SNAPSHOT="):
            new_lines.append(f"DAYTONA_SNAPSHOT={snapshot_id}")
            updated = True
        else:
            new_lines.append(line)
    if not updated:
        new_lines.append(f"DAYTONA_SNAPSHOT={snapshot_id}")
    ENV_PATH.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
    print(f"Updated {ENV_PATH} with DAYTONA_SNAPSHOT={snapshot_id}")


if __name__ == "__main__":
    main()
