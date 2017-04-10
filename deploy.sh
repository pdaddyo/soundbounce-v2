#!/usr/bin/env bash
npm run clean && npm run compile

rimraf ../d1091-academy-published-files/client

rsync -avhW --progress ./dist/ ../d1091-learning-lab-published-files/

cd ../d1091-learning-lab-published-files/

git pull
git add .
git commit -m"Automated deploy of compiled frontend"
git push

echo Done and done
