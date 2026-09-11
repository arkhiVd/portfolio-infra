---
title: "A small, private homelab"
description: "A bounded view of the devices, private access and file paths I use at home."
reviewed: "2026-09-09"
draft: false
---

This is a curated reference reviewed on 2026-09-09. It is not a complete or live inventory.

## Selected service access

An HP EliteDesk 800 G3 DM (65W) runs Linux Mint 22.3. Docker and Tailscale are active. For private services described here, access goes through Tailscale. Service data lives separately from containers, so replacing a container does not erase its persistent data.

<figure class="reference-figure">
  <img src="/diagrams/homelab-access.svg" alt="A selected private device connects through Tailscale to selected container services and then persistent data." />
  <figcaption>Selected private service path. <a href="/diagrams/homelab-access.svg">Open the full-size SVG</a> · <a href="https://github.com/arkhiVd/portfolio-infra/tree/main/web/diagrams">source</a></figcaption>
</figure>

## Selected file sync

Syncthing is running. A laptop and phone exchange files through Syncthing. That keeps the working copies aligned, but sync is not backup.

<figure class="reference-figure">
  <img src="/diagrams/homelab-sync.svg" alt="A laptop and phone exchange selected files through Syncthing." />
  <figcaption>Selected file path. Sync is not backup. <a href="/diagrams/homelab-sync.svg">Open the full-size SVG</a> · <a href="https://github.com/arkhiVd/portfolio-infra/tree/main/web/diagrams">source</a></figcaption>
</figure>

The public portfolio runs separately on AWS. It does not make live calls to the homelab.
