#!/bin/bash

force=''

while getopts 'f' flag; do
  case "${flag}" in
    f) force='true' ;;
    *) echo "Invalid option: -$flag" ;;
  esac
done

if [ ! -d "./.git/" ]
then
  echo -e "This command is only to be used when the project is IN the root directory of the repository"
else
  echo "-----
WARNING!!! This will erase any uncommited changes that you have right now.
To cancel the update press Ctrl+C. Commit and push your changes first and then run this update command again.
To continue with the update write yes and press Enter.
-----"
  read user_has_continued

  echo "Paste the URL of the git repository where the boilerplate is"
  read git_url

  echo "What is the name of the git branch where the updates are?"
  read git_branch

  if [ "$user_has_continued" != "yes" ]; then
    echo "Update canceled"
    exit 0
  fi

  echo "Updating..."

  git add .
  git reset --hard

  if [ "$force" = "true" ]; then
    mv ./.git ./.git-bkp

    git init
    git add .
    git commit -m "Before update"
  fi

  git remote add boilerplate $git_url
  git pull boilerplate $git_branch --allow-unrelated-histories

  if [ "$force" = "true" ]; then
    rm -rf ./.git/
    mv ./.git-bkp ./.git
  else
    git remote remove boilerplate
  fi

  git clean -Xdf

  echo "
-----
-----
-----
----- BEFORE CONTINUING:
- CHECK IF THE UPDATE DIDN'T FAILED HALFWAY:
  - Make sure the current git repository is again pointing to your project's repository and NOT to the boilerplate repository.
    - You can do this by running 'git remote' and checking that there is no remote called 'boilerplate'
    - IF YOU DID A FORCED UPDATE and it failed:
      - Delete the '.git/' directory (in the project's root directory) and restore this same directory with the one named '.git-bkp/'.
- If there were any conflicts, pick the updates you want to add to the project.
- Run 'npm run install:all' to update the 'package-lock.json' files with the dependencies changes.
- Run 'git add .' to stage all the accepted updates.
- If you did a normal update, run 'git merge --continue'. If you did a forced update using the '-f' flag, commit the update with 'git commit' as you would do with normal changes
    IF SOMETHING WENT WRONG in a normal update, you can run 'git merge --abort'.
    IF SOMETHING WENT WRONG In a forced update, just discard the changes as you normally would."
fi
