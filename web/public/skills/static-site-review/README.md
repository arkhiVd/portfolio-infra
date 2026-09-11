# Static site review

Source: [portfolio-infra](https://github.com/arkhiVd/portfolio-infra/tree/main/web/public/skills/static-site-review).

Install by copying this reviewed directory into a disposable target clone. For example:

```sh
target=$(mktemp -d)
mkdir -p "$target/.claude/skills"
cp -R web/public/skills/static-site-review "$target/.claude/skills/"
test -f "$target/.claude/skills/static-site-review/SKILL.md"
```

Review the files before use. This skill has no installer, network fetch, shell pipe, or global install.
