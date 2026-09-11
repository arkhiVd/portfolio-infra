---
title: "How I work"
description: "A reviewed account of my workflow, tools and reusable review checklist."
reviewed: "2026-09-09"
draft: false
---

## Overview

I keep infrastructure work small, inspect the evidence first, write a plan, and leave a fresh reviewer enough context to disagree. This page describes a Git-managed workflow and setup, not a live dashboard or a promise that every change follows the same path.

## AI workflow

The workflow is deliberately human-controlled. Agents help with bounded implementation and checks. They do not merge or apply changes.

<figure class="reference-figure">
  <img src="/diagrams/workflow.svg" alt="A vertical workflow: inspect, plan and specify, implement in bounds, run checks and review, then human approval and CI deployment." />
  <figcaption>From evidence to deployment. <a href="/diagrams/workflow.svg">Open the full-size SVG</a> · <a href="https://github.com/arkhiVd/portfolio-infra/blob/main/web/diagrams/workflow.mmd">source</a></figcaption>
</figure>

The steps are inspect, plan/spec, bounded implementation, lint/tests/build/browser checks and Terraform plan, fresh independent review, then human approval. CI deploys through OIDC after approval. I use one writer per file, run small checks on lighter models when that is enough, and escalate only when the work needs it. A fresh reviewer is independent, not a second voice for the same draft.

## Setup and tools

My laptop runs Omarchy on an Acer Swift SFG14-71. Pi is the working interface. A Codex subscription handles implementation where it fits. Herdr coordinates bounded agents, with explicit ownership rather than parallel edits to one file.

The repository supplies the useful evidence: Markdown and Terraform are reviewed as text, Node 24 runs the pinned site checks, Astro builds the static output, browser review catches layout and accessibility problems, and Terraform plan exposes infrastructure changes without applying them. The public site is deployed separately through GitHub Actions and OIDC.

## Reusable skills

I wrote a small, public checklist for reviewing a static site. It is read-only by default, asks for the operator's identity before any separately authorised infrastructure plan, and avoids project-specific private context. Read the [skill source](https://github.com/arkhiVd/portfolio-infra/tree/main/web/public/skills/static-site-review), [MIT license](/skills/static-site-review/LICENSE.txt), or download the [skill file](/skills/static-site-review/SKILL.md).

The visual critique is informed by Anthropic's third-party [frontend-design skill](https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design), which is not authored or owned by this site.
