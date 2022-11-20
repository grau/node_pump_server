#!/usr/bin/node
const fs = require('fs');

const deps = JSON.parse(fs.readFileSync('package.bak', 'utf-8'));
console.log(Object.keys(deps.dependencies).join(' '));