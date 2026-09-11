# AWS SAA Field Guide (SAA-C03)

Zero-to-exam prep for **AWS Certified Solutions Architect – Associate**.

## Open

```bash
cd /path/to/self-upgrade && python3 -m http.server 8765
# http://127.0.0.1:8765/aws-saa-guide/
```

## Build

```bash
./bin/guide build aws-saa-guide
# or:
cd aws-saa-guide && node tools/gen.js && node tools/build-search-index.js && node tools/verify.js
```

## Layout

- `tools/manifest.js` — site map
- `tools/content/` — authored fragments
- `tools/AUTHORING.md` / `prompt.md` — contracts
- Modules: foundations → networking → identity-security → compute → storage → databases → integration → resilience → cost-ops → exam

Sibling interview AWS (crisp): [`../devops-guide/aws/`](../devops-guide/aws/).
