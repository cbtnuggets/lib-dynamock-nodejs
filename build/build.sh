#!/bin/bash

echo "Ensuring correct node version:"
source ${NVM_DIR}/nvm.sh
node_version="$(cat .nvmrc)"
nvm install "${node_version}" || nvm use "${node_version}"

NODE_ENV=development npm install

./node_modules/.bin/eslint .

if [ $? -ne 0  ]; then
echo "Eslint failed"
exit 1
fi

NODE_ENV=test npm test

if [ $? -ne 0  ]; then
echo "Tests failed"
exit 1
fi

exit 0
