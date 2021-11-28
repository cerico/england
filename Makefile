create:
	npm run build
	ansible-playbook deploy/publish.yml
	git init
	git add .
	git commit -m "init"
	git branch -m main
	gh repo create england --public -y
	gh secret set DEPLOY_KEY < ~/.ssh/cheboksaru/deploy_rsa
	git push origin main
