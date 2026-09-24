"""Quick test: fetch page 1 of monsters + 2 skill details to verify the API structure."""
import json
import requests

API = "https://swarfarm.com/api/v2"
s = requests.Session()
s.headers["User-Agent"] = "sw-page-scraper/1.0"

# Monsters page 1
r = s.get(f"{API}/monsters/", params={"format": "json", "page_size": 3, "page": 1})
data = r.json()
print(f"Total monsters: {data['count']}")
m = data["results"][0]
print(f"\nFirst monster: {m['name']} ({m['element']}, {m['archetype']}, {m['base_stars']}★)")
print(f"  image_filename : {m['image_filename']}")
print(f"  bestiary_slug  : {m['bestiary_slug']}")
print(f"  skills (ids)   : {m['skills']}")
print(f"  leader_skill   : {m['leader_skill']}")
print(f"  awaken_level   : {m['awaken_level']}")
print(f"  awakens_from   : {m['awakens_from']}")
print(f"  awakens_to     : {m['awakens_to']}")
print(f"  awaken_bonus   : {m['awaken_bonus']}")

# Fetch a skill
if m["skills"]:
    sid = m["skills"][0]
    r2 = s.get(f"{API}/skills/{sid}/", params={"format": "json"})
    sk = r2.json()
    print(f"\nSkill {sk['id']}: {sk['name']}")
    print(f"  description : {sk['description']}")
    print(f"  cooltime    : {sk['cooltime']}")
    print(f"  slot        : {sk['slot']}")
    print(f"  max_level   : {sk['max_level']}")
    print(f"  multiplier  : {sk['multiplier_formula']}")
    print(f"  icon        : {sk['icon_filename']}")
    print(f"  upgrades    : {json.dumps(sk['upgrades'], indent=4)}")

# Leader skill if present
ls_id = m.get("leader_skill")
if ls_id:
    r3 = s.get(f"{API}/leader-skills/{ls_id}/", params={"format": "json"})
    ls = r3.json()
    print(f"\nLeader skill: {ls}")
