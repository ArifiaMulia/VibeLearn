import sys, shutil, time, re

conf_path = '/host-lb/nginx.conf'
with open(conf_path, 'r', encoding='utf-8') as f:
    content = f.read()

target_port = '30128'

if 'vibe.virtuenet.space' in content:
    if f'127.0.0.1:{target_port}' in content:
        print(f"DOMAIN_ALREADY_CONFIGURED: vibe.virtuenet.space -> NodePort {target_port} found in nginx.conf")
        sys.exit(0)
    # If vibe.virtuenet.space exists with a different upstream/port, update its server block
    backup_path = f"/host-lb/nginx.conf.bak.{int(time.time())}"
    shutil.copy2(conf_path, backup_path)
    print(f'Created backup at {backup_path}')
    # Replace proxy_pass inside the vibe.virtuenet.space server block
    pattern = r'(server_name\s+vibe\.virtuenet\.space;[\s\S]*?proxy_pass\s+http://127\.0\.0\.1:)\d+(;)'
    if re.search(pattern, content):
        new_content = re.sub(pattern, rf'\g<1>{target_port}\g<2>', content, count=1)
        with open(conf_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated existing vibe.virtuenet.space block to NodePort {target_port}')
        sys.exit(0)
    print("DOMAIN_ALREADY_CONFIGURED: vibe.virtuenet.space found in nginx.conf")
    sys.exit(0)

backup_path = f"/host-lb/nginx.conf.bak.{int(time.time())}"
shutil.copy2(conf_path, backup_path)
print(f'Created backup at {backup_path}')

idx = content.rfind('}')
if idx == -1:
    print('ERROR: Closing brace not found in nginx.conf', file=sys.stderr)
    sys.exit(1)

server_block = f'''
    # --------------------------------------------------------------------------
    # Promptara / VibeLearn AI Coding Academy (vibe.virtuenet.space) -> NodePort {target_port}
    # --------------------------------------------------------------------------
    server {{
        listen 127.0.0.1:8443 ssl;
        http2  on;
        server_name vibe.virtuenet.space;

        ssl_certificate     /etc/ssl/virtuenet/wildcard.virtuenet.space.crt;
        ssl_certificate_key /etc/ssl/virtuenet/wildcard.virtuenet.space.key;

        client_max_body_size 50M;

        location / {{
            proxy_pass http://127.0.0.1:{target_port};
            add_header X-Permitted-Cross-Domain-Policies "none" always;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
            proxy_buffering on;
            proxy_read_timeout 180s;
        }}
        include /etc/nginx/app_suspended.conf;
    }}

    server {{
        listen 80;
        server_name vibe.virtuenet.space;
        return 301 https://$host$request_uri;
    }}
'''

new_content = content[:idx] + server_block + '\n\n' + content[idx:]
with open(conf_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print(f'Appended vibe.virtuenet.space configuration block (NodePort {target_port}) to nginx.conf')
