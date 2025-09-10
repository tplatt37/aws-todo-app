#!/bin/bash

#
# To create a zip for distribution (MacOS)
# NOTE: This is NOT the "standalone" build - this includes static assets 
npm run build

zip -r -9 todo.zip .next/ package*.json next.config.js -x "*.DS_Store" "*/__MACOSX/*"

