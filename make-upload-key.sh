#!/usr/bin/env bash
# Creates the Google Play UPLOAD key for the GitHub-built app (option B).
# Run once on a computer with Java installed (Windows: use Git Bash). KEEP the .keystore file and passwords safe –
# without them you cannot publish updates (Play App Signing can reset a lost upload key, but it takes days).
set -e
ALIAS=passageplanner
read -s -p "Choose a keystore password (min 6 characters): " PASS; echo
keytool -genkeypair -v -keystore upload.keystore -alias "$ALIAS" -keyalg RSA -keysize 4096 -validity 10000 \
  -storepass "$PASS" -keypass "$PASS" -dname "CN=Passage Planner, O=Passage Planner, C=PH"
base64 -w0 upload.keystore > upload.keystore.base64.txt 2>/dev/null || base64 -i upload.keystore -o upload.keystore.base64.txt
echo
echo "Add these 4 secrets in GitHub → repository → Settings → Secrets and variables → Actions → New repository secret:"
echo "  ANDROID_KEYSTORE_BASE64  = contents of upload.keystore.base64.txt"
echo "  ANDROID_KEYSTORE_PASSWORD = the password you typed"
echo "  ANDROID_KEY_ALIAS         = $ALIAS"
echo "  ANDROID_KEY_PASSWORD      = the password you typed"
echo
echo "SHA-256 fingerprint (only needed for .well-known/assetlinks.json):"
keytool -list -v -keystore upload.keystore -alias "$ALIAS" -storepass "$PASS" | grep "SHA256:"
