---
title: "When two CDNs cache one site"
description: "Why www is DNS-only at Cloudflare when CloudFront delivers this static portfolio."
published: "2026-09-08"
tags:
  - cloudfront
  - cloudflare
  - caching
draft: false
---

This portfolio is static Astro output in a private S3 bucket. CloudFront reads that bucket through origin access control. The browser calls the visitor counter's separate Lambda Function URL, which Terraform injects into the site script. CloudFront does not proxy that request.

The caching boundary matters. Cloudflare handles the apex redirect, while `www` is DNS-only and points visitors to CloudFront. If both providers cached the site response, a content change would have two caches to invalidate and two sets of headers to inspect. That is more moving parts than this site needs.

Keeping `www` DNS-only gives the public site one delivery cache. CloudFront owns the static response path. Cloudflare still has the apex redirect job, without becoming another cache in front of the portfolio.

The infrastructure is small, but the distinction is worth writing down. A cache layer should have a clear owner, especially when the site is deployed from a static build and the only dynamic request bypasses it.

## Sources

- [Portfolio case study](/projects/portfolio.html)
- [Portfolio infrastructure source](https://github.com/arkhiVd/portfolio-infra)
