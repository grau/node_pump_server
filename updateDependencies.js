'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function updateDependecies() {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));

    const dependencies = packageJson.dependencies ? Object.keys(packageJson.dependencies) : [];
    const devDependencies = packageJson.devDependencies ? Object.keys(packageJson.devDependencies) : [];

    console.log(dependencies.join(' '));
    console.log(devDependencies.join(' '));

    if (dependencies.length > 0) {
        await new Promise((resolve, reject) => {
            const proc = spawn('yarn', ['add', ...dependencies], { stdio: 'inherit' });
            proc.on('exit', () => {
                console.log('\n\n'
                    + '+----------------------------------+\n'
                    + '| Dependecies updated successfully |\n'
                    + '+----------------------------------+\n\n');
                resolve(null);
            });
            proc.on('error', () => {
                console.error('\n\n'
                    + '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n'
                    + '! Dependecies update  F A I L E D  !\n'
                    + '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n');
                reject(null);
            });
        });
    } else {
        console.log('\n\n'
            + '+------------------------------+\n'
            + '| No dependecies to update ... |\n'
            + '+------------------------------+\n\n');
    }

    if (devDependencies.length > 0) {
        await new Promise((resolve, reject) => {
            const proc = spawn('yarn', ['add', ...devDependencies, '--dev'], { stdio: 'inherit' });
            proc.on('exit', () => {
                console.log('\n\n'
                    + '+-------------------------------------+\n'
                    + '| devDependecies updated successfully |\n'
                    + '+-------------------------------------+\n\n');
                resolve(null);
            });
            proc.on('error', () => {
                console.error('\n\n'
                    + '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n'
                    + '! devDependecies update  F A I L E D  !\n'
                    + '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n');
                reject(null);
            });
        });
    } else {
        console.log('\n\n'
            + '+---------------------------------+\n'
            + '| No devDependecies to update ... |\n'
            + '+---------------------------------+\n\n');
    }
}

updateDependecies();
