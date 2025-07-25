#!/bin/bash

cd "$(dirname "$0")"
read -p "Script Display Name: " SCRIPT_DISPLAY_NAME
SCRIPT_SLUG=$(echo "$SCRIPT_DISPLAY_NAME" | iconv -t ascii//TRANSLIT | sed -r s/[~\^]+//g | sed -r s/[^a-zA-Z0-9]+/-/g | sed -r s/^-+\|-+$//g | tr A-Z a-z)
SCRIPT_CLASS=$(echo "$SCRIPT_SLUG" | sed -E 's/(^|-)([a-z])/\U\2/g');
cp template.js ../"$SCRIPT_SLUG.js"
sed -i -e "s/ScriptName/$SCRIPT_DISPLAY_NAME/g" ../"$SCRIPT_SLUG.js"
sed -i -e "s/ScriptClass/$SCRIPT_CLASS/g" ../"$SCRIPT_SLUG.js"