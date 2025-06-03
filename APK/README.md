# Agenda-Saude

gerar o google-service com script
configurar eas secret com o google-service...
buidar com eas build --profile production --platform android
eas secret:create --scope project --name SECRET_NAME --value secretvalue --type string
mais informações: https://docs.expo.dev/build-reference/variables/

tutorial para apagar chaves:

git log --oneline (ve todos os hashs de commit que quer editar selecionar até o ultimo que quer editar)
git rebase -i HASHDOCOMMIT^ (começa or rebase)
troca o nome pick de cada commmit para edit -> ctrl + x -> ctrl + y (usando o editor nano)
git commit --amend (salva a mudança) e salvar com ctrl + x -> ctrl + y
git rebase --continue (proximo commit) até terminar
enviar com git push origin <branch> --force
