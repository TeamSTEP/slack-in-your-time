#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import projectPacks from '../package.json';
import _ from 'lodash';

import * as glitchDeploy from 'glitch-deploy-tool';

interface NpmPackage {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

// properties that we want to keep from the original
const packageKeys = ['name', 'version', 'scripts', 'devDependencies', 'dependencies', 'engines'];
// properties we will manually override
const npmScripts = { start: 'node index.js' };

/**
 * Dynamically generate a package.json file for the distribution package
 */
const generatePackConfig = () => {
    const packCfg: NpmPackage = {
        name: 'deploy-build',
    };

    for (const [key, value] of Object.entries(projectPacks)) {
        if (packageKeys.includes(key)) {
            // Object.defineProperty(packCfg, key, {
            //     value: key === 'scripts' ? npmScripts : value,
            //     writable: true,
            // });
            packCfg[key] = key === 'scripts' ? npmScripts : value;
        }
    }
    return packCfg;
};

const importFromFolder = async (repoUrl: string, targetPath?: string, debugMessage?: boolean) => {
    const glitchRepo = new glitchDeploy.GlitchGit(repoUrl, debugMessage);

    await glitchRepo.publishFilesToGlitch(targetPath);

    console.log('successfully imported projects from ' + (targetPath || process.cwd()));
};

(async () => {
    console.log('starting deployment...');
    const distPath = path.join(process.cwd(), 'dist');
    const sourceRepo = process.env.REPO_SOURCE;

    if (!sourceRepo) throw new Error('No deploy repository provided');

    const packageConfig = generatePackConfig();

    fs.writeFile(`${distPath}/package.json`, JSON.stringify(packageConfig), function (err) {
        if (err) throw err;
        console.log('deploying local file to Glitch...');
        importFromFolder(sourceRepo, distPath).then(() => {
            console.log('successfully deployed application to glitch');
            process.exit(0);
        });
    });
})().catch((err) => {
    console.log(err);
    process.exit(1);
});
