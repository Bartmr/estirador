
if [ $(dpkg-query -W -f='${Status}' jq 2>/dev/null | grep -c "ok installed") -eq 0 ];
then
  sudo apt-get install jq;
fi

check() {
  jq -r '.dependencies,.devDependencies|keys[]' $1 | while read line; do \
    printf "$line: "
    [ "$(npm show "$line" | grep -ic 'DEPRECATED')" != "0" ] && \
    printf "\e[1;31m""DEPRECATED\n""\e[0m" || \
    printf "\e[1;32m""not deprecated.\n""\e[0m"
  done
}

echo '--- API ---'

check package.json


echo '\n\n\n --- CLIENT-SIDE/WEB-APP ---'

check client-side/web-app/package.json
