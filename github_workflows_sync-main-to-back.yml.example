name: Sync Main to Back

on:
  push:
    branches:
      - main

jobs:
  sync:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Set up Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

      - name: Fetch all branches
        run: git fetch --all

      - name: Checkout back branch
        run: git checkout back

      - name: Merge main into back
        run: git merge origin/main

      - name: Push changes to back
        run: git push origin back