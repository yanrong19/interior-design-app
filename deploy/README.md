# Deploying Roomwright

Every push to `main` builds the app on GitHub Actions and puts it live at
**http://168.138.173.149:8082**. Pull requests only build, which catches type errors before merge.

## How it works

1. **Build** (`.github/workflows/deploy.yml`): `npm ci`, then `npm run build` (type-check plus Vite build).
2. **Upload**: `rsync` copies `dist/` to `/var/www/roomwright/releases/<time>-<commit>/` as the `deploy` user.
3. **Switch**: the `current` link moves to the new release in one step, and only the five newest releases are kept.
4. **Check**: the server is asked for the page, and the run fails if it doesn't answer.

nginx (`deploy/nginx/roomwright.conf`) serves `/var/www/roomwright/current` on port 8082. It sends every
route to `index.html` and caches the hashed files in `/assets/` for a year. The other sites on the server
(pfi on port 80, praxus on 8081) are separate and untouched.

## Security

- GitHub logs in as `deploy`, a user with no sudo that can only write `/var/www/roomwright`.
- Its key is a dedicated deploy key, marked `restrict` on the server (no tunnels, forwarding or terminal).
  To revoke it, delete its line from `/home/deploy/.ssh/authorized_keys`.
- The server's host key is pinned in `deploy/known_hosts`, so the workflow refuses any other machine at that IP.
- The only secret is `DEPLOY_SSH_KEY` (the private deploy key), stored in the repo's Actions secrets.

## One-time setup (already done on 2026-10-21)

```bash
sudo bash server-setup.sh roomwright.conf roomwright_deploy.pub
```

The script is safe to re-run. It creates the `deploy` user and its key, the site folders, the SELinux labels,
opens port 8082 in firewalld and reloads nginx (it never restarts it).

**Oracle Cloud network rule** for port 8082: Networking → Virtual cloud networks → your VCN → Security Lists
(or the Network Security Group attached to the instance) → Add Ingress Rule: source `0.0.0.0/0`, TCP,
destination port `8082`.

## Roll back

```bash
ssh rocky@168.138.173.149
cd /var/www/roomwright && ls -1t releases/       # newest first
sudo -u deploy ln -sfn releases/<older-release> current
```

Or re-run an older successful workflow run from the Actions tab.
