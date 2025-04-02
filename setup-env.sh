#!/bin/bash

# Script to set up environment files for new developers

# Make sure the pre-commit hook for preventing env files is set up correctly
echo "Setting up pre-commit hook..."
if [ -d .git/hooks ]; then
  cp -f .git/hooks/pre-commit .git/hooks/pre-commit.backup 2>/dev/null || true
  cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh

# Check for .env files being committed but allow example files
STAGED_ENV_FILES=$(git diff --cached --name-only | grep -E "\.env$|\.env\.local$|\.env\.development\.local$|\.env\.test\.local$|\.env\.production\.local$" || true)

# If we found any .env files
if [ -n "$STAGED_ENV_FILES" ]; then
  echo "ERROR: Attempt to commit .env file with secrets detected."
  echo "Please remove these .env files from your commit:"
  echo "$STAGED_ENV_FILES"
  exit 1
fi

# Continue with commit
exit 0
EOF
  chmod +x .git/hooks/pre-commit
  echo "✅ Pre-commit hook installed"
else
  echo "⚠️ No .git directory found - skipping pre-commit hook setup"
fi

# Create .env.local file from example if it doesn't exist
if [ ! -f .env.local ]; then
  echo "Creating .env.local file from example..."
  cp .env.example .env.local
  echo "✅ Created .env.local file"
  echo "⚠️ Please edit .env.local with your actual API keys"
else
  echo "ℹ️ .env.local already exists - skipping"
fi

echo "
Setup completed! Next steps:
1. Edit your .env.local file with your actual API keys
2. Run 'npm install' or 'yarn' to install dependencies
3. Run 'npm run dev' or 'yarn dev' to start the development server
" 