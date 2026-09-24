"""
Summoners War bestiary scraper
Pulls all monster + skill + leader-skill data from swarfarm.com API
and downloads all monster/skill images.

Output layout:
  data/
    monsters.json       – all 3 000+ monsters, skills embedded
    skills.json         – all skills indexed by id
    leader_skills.json  – all leader skills indexed by id
  images/
    monsters/           – unit_icon_*.png
    skills/             – skill_icon_*.png
"""

import json
import os
import time
import sys
from pathlib import Path

import requests
from tqdm import tqdm

# ── Config ────────────────────────────────────────────────────────────────────
API_BASE   = "https://swarfarm.com/api/v2"
IMG_BASE   = "https://swarfarm.com/static/herders/images"
PAGE_SIZE  = 100
DELAY      = 0.15          # seconds between requests (be polite)
DATA_DIR   = Path(__file__).parent.parent / "data"
IMG_DIR    = Path(__file__).parent.parent / "images"

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "sw-page-scraper/1.0 (educational project)"})


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_json(url: str, params: dict = None) -> dict:
    resp = SESSION.get(url, params=params, timeout=30)
    resp.raise_for_status()
    time.sleep(DELAY)
    return resp.json()


def fetch_all_pages(endpoint: str) -> list:
    """Fetch every page of a paginated API endpoint."""
    url    = f"{API_BASE}/{endpoint}/"
    params = {"format": "json", "page_size": PAGE_SIZE, "page": 1}
    first  = get_json(url, params)
    total  = first["count"]
    pages  = (total + PAGE_SIZE - 1) // PAGE_SIZE
    items  = first["results"]

    for page in tqdm(range(2, pages + 1), desc=endpoint, unit="page"):
        params["page"] = page
        data = get_json(url, params)
        items.extend(data["results"])

    return items


def download_image(subdir: str, filename: str) -> None:
    dest = IMG_DIR / subdir / filename
    if dest.exists():
        return
    url  = f"{IMG_BASE}/{subdir}/{filename}"
    try:
        r = SESSION.get(url, timeout=20)
        r.raise_for_status()
        dest.write_bytes(r.content)
        time.sleep(DELAY)
    except Exception as e:
        print(f"  [warn] could not download {url}: {e}", file=sys.stderr)


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (IMG_DIR / "monsters").mkdir(parents=True, exist_ok=True)
    (IMG_DIR / "skills").mkdir(parents=True, exist_ok=True)

    # ── 1. Skills ─────────────────────────────────────────────────────────────
    print("\n=== Fetching skills ===")
    skills_list = fetch_all_pages("skills")
    skills_by_id = {s["id"]: s for s in skills_list}

    # ── 2. Leader skills ──────────────────────────────────────────────────────
    print("\n=== Fetching leader skills ===")
    leader_list = fetch_all_pages("leader-skills")
    leaders_by_id = {ls["id"]: ls for ls in leader_list}

    # ── 3. Monsters ───────────────────────────────────────────────────────────
    print("\n=== Fetching monsters ===")
    monsters_list = fetch_all_pages("monsters")

    # Embed full skill + leader-skill objects into each monster
    for m in monsters_list:
        m["skills_detail"] = [
            skills_by_id.get(sid) for sid in (m.get("skills") or [])
        ]
        ls_id = m.get("leader_skill")
        if isinstance(ls_id, int):
            m["leader_skill_detail"] = leaders_by_id.get(ls_id)
        elif isinstance(ls_id, dict):
            # already expanded (older API versions)
            m["leader_skill_detail"] = ls_id
        else:
            m["leader_skill_detail"] = None

        # Build absolute image URL for convenience
        img = m.get("image_filename")
        m["image_url"] = f"{IMG_BASE}/monsters/{img}" if img else None

    # ── 4. Save JSON ──────────────────────────────────────────────────────────
    print("\n=== Saving JSON ===")
    (DATA_DIR / "monsters.json").write_text(
        json.dumps(monsters_list, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (DATA_DIR / "skills.json").write_text(
        json.dumps(skills_by_id, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (DATA_DIR / "leader_skills.json").write_text(
        json.dumps(leaders_by_id, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"  monsters : {len(monsters_list)}")
    print(f"  skills   : {len(skills_by_id)}")
    print(f"  leaders  : {len(leaders_by_id)}")

    # ── 5. Download images ────────────────────────────────────────────────────
    print("\n=== Downloading monster images ===")
    monster_imgs = {
        m["image_filename"] for m in monsters_list if m.get("image_filename")
    }
    for fn in tqdm(monster_imgs, desc="monster images", unit="img"):
        download_image("monsters", fn)

    print("\n=== Downloading skill icons ===")
    skill_imgs = {
        s["icon_filename"] for s in skills_list if s.get("icon_filename")
    }
    for fn in tqdm(skill_imgs, desc="skill icons", unit="img"):
        download_image("skills", fn)

    print("\n✓ Done. Data saved to ./data/, images saved to ./images/")


if __name__ == "__main__":
    main()
