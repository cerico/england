source config.env
sftp -i $key $user@$server << EOF
  cd /etc/nginx/conf.d
  put nginx/$server.conf
  mkdir /var/www/html/$server
  cd /var/www/html/$server
  put server.js
  put package.json
  mkdir dist
  put -r dist
  bye
EOF
ssh $user@$server -i $key << EOF
  cd /var/www/html/$server
  npm install --only=production
  pm2 start server.js --name $server
  pm2 save
  sudo service nginx stop
  sudo /opt/letsencrypt/letsencrypt-auto certonly --standalone -d $server -n
  sudo service nginx start
EOF
