#!/bin/bash
node ./src/utils/CustomView/parsers/custom-view.js

peggy \
  --extra-options-file ./src/utils/CustomView/parsers/pegconfig.json \
  -o ./src/utils/CustomView/parsers/custom-view.generated.ts \
  ./src/utils/CustomView/parsers/custom-view.generated.pegjs