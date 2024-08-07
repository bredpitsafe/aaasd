#!/bin/bash
ts-json-schema-generator \
  --tsconfig './src/schemas/tsconfig.json' \
  --path './src/schemas/types.ts' \
  --type 'Dashboard' \
  --out './src/schemas/generated/Dashboard.json' \
  --additional-properties 'true' \
  --jsDoc 'none'

ts-json-schema-generator \
  --tsconfig './src/schemas/tsconfig.json' \
  --path './src/schemas/types.ts' \
  --type 'Panel' \
  --out './src/schemas/generated/Panel.json' \
  --additional-properties 'true' \
  --jsDoc 'none'

ts-json-schema-generator \
  --tsconfig './src/schemas/tsconfig.json' \
  --path './src/schemas/types.ts' \
  --type 'DashboardXML' \
  --out './src/schemas/generated/DashboardXML.json' \
  --additional-properties 'true' \
  --jsDoc 'extended' \
  --expose 'none' \
  --minify \
  --no-top-ref \

ts-json-schema-generator \
  --tsconfig './src/schemas/tsconfig.json' \
  --path './src/schemas/types.ts' \
  --type 'PanelXML' \
  --out './src/schemas/generated/PanelXML.json' \
  --additional-properties 'true' \
  --jsDoc 'extended' \
  --expose 'none' \
  --minify \
  --no-top-ref \
