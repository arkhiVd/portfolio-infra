# Diagram sources

The Mermaid sources in this directory are rendered to `web/public/diagrams/` with Mermaid CLI 11.17.0. From `web`, run with an operator-supplied Puppeteer config:

```sh
mmdc -p "$PUPPETEER_CONFIG" -c diagrams/mermaid.config.json -b "#0F1218" -i diagrams/homelab-access.mmd -o public/diagrams/homelab-access.svg
mmdc -p "$PUPPETEER_CONFIG" -c diagrams/mermaid.config.json -b "#0F1218" -i diagrams/homelab-sync.mmd -o public/diagrams/homelab-sync.svg
mmdc -p "$PUPPETEER_CONFIG" -c diagrams/mermaid.config.json -b "#0F1218" -i diagrams/workflow.mmd -o public/diagrams/workflow.svg
```

The committed SVGs keep clean-clone builds independent of the renderer. Captions carry the "sync is not backup" note.
