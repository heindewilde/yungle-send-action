# Send files with Yungle

Send a build's output to a client as a private, EU-hosted
[Yungle](https://yungle.co/?ref=github-action) transfer: resumable uploads up to 100 GB,
always encrypted, with a link that expires. Works on the free plan.

```yaml
- uses: heindewilde/yungle-send-action@v1
  id: deliver
  with:
    api-key: ${{ secrets.YUNGLE_API_KEY }}
    path: dist/
    to: client@example.com
    message: Release ${{ github.ref_name }} is ready.
- run: echo "Link: ${{ steps.deliver.outputs.url }}"
```

Create a key with the **Send transfers** scope under
[Settings → API keys](https://yungle.co/dashboard/settings/api?ref=github-action) and
store it as the `YUNGLE_API_KEY` secret.

## Inputs

| Input | | |
|---|---|---|
| `api-key` | required | A key with `transfers:write`. |
| `path` | required | Files or directories, one per line. |
| `to` | | Recipients, comma- or newline-separated. Empty means link only. |
| `message` | | A note for the recipients. |
| `title` | | A dashboard label; recipients never see it. |
| `expires` | | Days, clamped to your plan (7 on free). |
| `password` | | Recipients must enter it. Pass it from a secret; it is masked in logs. |
| `cli-version` | | The `yungle-cli` version, default latest `0.x`. |

## Outputs

`url`, `id`, `expires-at`. A summary with the link is added to the run.

Runs [`yungle-cli`](https://github.com/heindewilde/yungle-clients) under the hood.
Docs: <https://yungle.co/developers/recipes/ci-artefacts?ref=github-action>

MIT
