#!/bin/bash

if [ -d "./.git/" ]
then
  echo -e "This command is only to be used when the project is NOT in the root directory of a Git repository"
else
  echo "Paste the URL of the git repository where the boilerplate is"
  read git_url

  echo "What is the name of the git branch where the updates are?"
  read git_branch

  echo "Updating..."

  if [ -f "./.git" ]; then
    mv .git .git-file-bkp
  fi

  git init
  git add .
  git commit -m "Before update"

  git remote add boilerplate $git_url
  git pull boilerplate $git_branch --allow-unrelated-histories

  rm -rf ./.git/

  if [ -f "./.git" ]; then
    mv .git-file-bkp .git
  fi

  git clean -Xdf

  git checkout -- package-lock.json **/package-lock.json

  echo -e "\n-----\n-----\n-----
----- BEFORE CONTINUING:
- CHECK IF THE UPDATE DIDN'T FAILED HALFWAY:
  - Make sure the current git repository is again pointing to your project's repository and NOT to the boilerplate repository.
    - You can do this by running 'git remote' and checking that there is no remote called 'boilerplate'
    - If the update failed:
      - Delete the '.git/' directory in the root directory of the repository where this project is stored.
- Pick the updates you want to add to the project
- Run 'npm run install:all' to update the 'package-lock.json' files with the dependencies changes
- Commit everything as normal work"
fi
