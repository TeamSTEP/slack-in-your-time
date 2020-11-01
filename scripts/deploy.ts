#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';

import * as glitchDeploy from 'glitch-deploy-tool/lib';

const packageConfig = {
    name: 'slack-in-your-time',
    version: '0.0.1',
    description: "A Slack application that can convert your time to everyone else's",
    author: 'Hoon Kim',
    scripts: {
        start: 'node index.js',
    },
    devDependencies: {
        '@types/jest': '^26.0.15',
        '@types/lodash': '^4.14.162',
        '@types/node': '^14.14.5',
        '@types/node-fetch': '^2.5.7',
        '@typescript-eslint/eslint-plugin': '^4.6.0',
        '@typescript-eslint/parser': '^4.6.0',
        '@vercel/ncc': '^0.24.1',
        dotenv: '^8.2.0',
        eslint: '^7.12.1',
        'eslint-config-prettier': '^6.15.0',
        'eslint-plugin-prettier': '^3.1.4',
        'glitch-deploy-tool': '^0.1.3-alpha',
        jest: '^26.6.1',
        'jest-config': '^26.6.1',
        prettier: '^2.1.2',
        rimraf: '^3.0.2',
        'sync-glitch-cli': '^2.0.1',
        'ts-jest': '^26.4.3',
        'ts-node': '^9.0.0',
        'ts-node-dev': '^1.0.0-pre.63',
        typescript: '^4.0.5',
    },
    dependencies: {
        '@slack/bolt': '^2.4.1',
        axios: '^0.21.0',
        lodash: '^4.17.20',
        moment: '^2.29.1',
        node: '^15.0.1',
        'reflect-metadata': '^0.1.13',
    },
    engines: {
        node: '>=12.x',
    },
};

const importFromFolder = async (repoUrl: string, targetPath?: string, debugMessage?: boolean) => {
    const glitchRepo = new glitchDeploy.GlitchGit(repoUrl, debugMessage);

    try {
        await glitchRepo.publishFilesToGlitch(targetPath);
    } catch (e) {
        glitchRepo.cleanGitInstance();
        throw e;
    }

    console.log('successfully imported projects from ' + (targetPath || process.cwd()));
};

(async () => {
    console.log('starting deployment...');
    const distPath = path.join(process.cwd(), 'dist');
    const sourceRepo = process.env.REPO_SOURCE;

    if (!sourceRepo) throw new Error('No deploy repository provided');

    fs.writeFile(`${distPath}/package.json`, JSON.stringify(packageConfig), function (err) {
        if (err) throw err;
        console.log('deploying local file to Glitch...');
        importFromFolder(sourceRepo, distPath).then(() => {
            console.log('deployed application to glitch');
            process.exit(0);
        });
    });
})().catch((err) => {
    console.log(err);
    process.exit(1);
});
