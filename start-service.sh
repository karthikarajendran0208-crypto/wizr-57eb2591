#!/bin/bash
# Start script for wizr-frontend systemd service.
# Sourcing the profile ensures that node/npm are loaded even if using version managers like NVM, FNM, or Bun.

# Navigate to the workspace
cd /home/karthika/wizr-57eb2591 || exit 1

# Load user profile environment (useful for NVM/FNM/Bun)
if [ -f "$HOME/.bashrc" ]; then
    source "$HOME/.bashrc"
fi
if [ -f "$HOME/.profile" ]; then
    source "$HOME/.profile"
fi

# Run npm
exec npm run dev
