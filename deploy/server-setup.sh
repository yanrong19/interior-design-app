#!/usr/bin/env bash
# One-time (and safe to re-run) setup of the Roomwright site on the Rocky Linux server.
# Run as a sudo-capable user:
#   sudo bash server-setup.sh roomwright.conf deploy_key.pub
# It creates a `deploy` user that can only write the site folder, installs the nginx
# site on port 8082, opens that port in firewalld and labels files for SELinux.
# It reloads nginx (never restarts it), so the other sites on this server stay up.
set -euo pipefail

NGINX_CONF_SRC="${1:?path to roomwright.conf}"
DEPLOY_PUBKEY="${2:?path to the deploy public key}"
PORT=8082
ROOT=/var/www/roomwright
DEPLOY_USER=deploy

echo "== deploy user"
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash "$DEPLOY_USER"
fi
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 700 "/home/$DEPLOY_USER/.ssh"
# `restrict` turns off port forwarding, agent forwarding and terminals for this key.
KEY_LINE="restrict $(cat "$DEPLOY_PUBKEY")"
AUTH="/home/$DEPLOY_USER/.ssh/authorized_keys"
touch "$AUTH"
grep -qxF "$KEY_LINE" "$AUTH" || echo "$KEY_LINE" >> "$AUTH"
chown "$DEPLOY_USER:$DEPLOY_USER" "$AUTH"
chmod 600 "$AUTH"
restorecon -R "/home/$DEPLOY_USER/.ssh"

echo "== site folders"
install -d -m 755 /var/www
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 755 "$ROOT" "$ROOT/releases"
if [ ! -e "$ROOT/current" ]; then
  # Placeholder until the first deploy lands.
  install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 755 "$ROOT/releases/placeholder"
  echo '<!doctype html><title>Roomwright</title><p>Waiting for the first deploy.</p>' > "$ROOT/releases/placeholder/index.html"
  chown "$DEPLOY_USER:$DEPLOY_USER" "$ROOT/releases/placeholder/index.html"
  sudo -u "$DEPLOY_USER" ln -sfn releases/placeholder "$ROOT/current"
fi

echo "== SELinux"
if ! semanage fcontext -l | grep -q "^$ROOT(/.\*)?"; then
  semanage fcontext -a -t httpd_sys_content_t "$ROOT(/.*)?"
fi
restorecon -R "$ROOT"
if ! semanage port -l | grep -E '^http_port_t\s' | grep -qw "$PORT"; then
  semanage port -a -t http_port_t -p tcp "$PORT"
fi

echo "== firewall"
if ! firewall-cmd --permanent --query-port="$PORT/tcp" >/dev/null; then
  firewall-cmd --permanent --add-port="$PORT/tcp"
  firewall-cmd --reload
fi

echo "== nginx"
install -m 644 "$NGINX_CONF_SRC" /etc/nginx/conf.d/roomwright.conf
restorecon /etc/nginx/conf.d/roomwright.conf
nginx -t
systemctl reload nginx

echo "== check"
curl -fsS -o /dev/null -w "local http://127.0.0.1:$PORT/ -> %{http_code}\n" "http://127.0.0.1:$PORT/"
