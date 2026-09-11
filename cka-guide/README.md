# CKA Field Guide (Curriculum v1.35)

Zero-to-exam prep for **Certified Kubernetes Administrator (CKA)** on **Kubernetes v1.35**.

## Open

```bash
cd /path/to/self-upgrade && python3 -m http.server 8765
# http://127.0.0.1:8765/cka-guide/
```

## Build

```bash
./bin/guide build cka-guide
# or:
cd cka-guide && node tools/gen.js && node tools/build-search-index.js && node tools/verify.js
```

## Layout

- `tools/manifest.js` — site map
- `tools/content/` — authored fragments
- `tools/AUTHORING.md` / `prompt.md` — contracts
- Modules: foundations → workloads → storage → networking → cluster → troubleshooting → exam

This guide is **self-contained** — no dependency on other field guides.
