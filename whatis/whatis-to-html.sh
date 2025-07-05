#!/bin/bash
# This script converts markdown to HTML which can be previewed in a browser and copied and pasted into a Roll20
# handout. This script is designed for linux systems with `pandoc` installed.

pandoc --wrap=none -f markdown_strict ./whatis.md > whatis.html
sed -i -r 's/==([^==]*)==/<mark>\1<\/mark>/g' whatis.html

