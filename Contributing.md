Contributing guidelines
---

### Maintainers

* Pascal Belloncle ([@psq](https://twitter.com/psq))
* Joel Kemp ([@mrjoelkemp](https://twitter.com/mrjoelkemp))

### Disclaimers:

1. If you want to change the stylistic output of the generated markdown, please use the `--templateDir` option to supply custom mustache templates.
 - Only template changes that incorporate new tags (or fix visual bugs) will be considered for review.

### Regenerate sample_output ###

If your PR makes changes to the output, regenerate the sample_output content by running
```
node jsdox.js -i --rr -o sample_output/ fixtures
```

### Update README.md and CHANGES.md ###

As needed.

### Pull-requests

If you fixed or added something useful to the project, you can send a pull-request that **includes unit tests** for your change(s).
Your PR will be reviewed by a maintainer and accepted, or commented for rework, or declined.
