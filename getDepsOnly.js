#!/usr/bin/node
const fs = require('fs');

const deps = JSON.parse(fs.readync('package.json', 'utf-8'));
console.log(Object.keys(deps.dependencies).join(' '));