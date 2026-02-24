#!/bin/bash

# Get commit message from argument or prompt the user
commit_message="$1"

if [ -z "$commit_message" ]; then
    echo -n "Enter commit message: "
    read commit_message
fi

# Abort if message is still empty
if [ -z "$commit_message" ]; then
    echo "Commit message cannot be empty. Aborting."
    exit 1
fi

echo "Adding changes..."
git add .

echo "Committing..."
git commit -m "$commit_message"

echo "Pushing to remote..."
git push

echo "Done! 🚀"
