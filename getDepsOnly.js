import fs from 'fs-extra';

const deps = fs.readJSONSync('package.json');
console.log(Object.keys(deps.dependencies).join(' '));