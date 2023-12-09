import * as core from '@actions/core';
import * as tar from 'tar';
import * as path from 'path';
import * as fs from 'fs';

async function run(): Promise<void> {
  try {
    const cacheKey = core.getState('VIRTUALENV_CACHE_KEY');
    const cachePath = core.getState('VIRTUALENV_DIRECTORY');
    const tarballPath = path.join('/caching', `${cacheKey}.tar`);

    core.info(`Cache key: ${cacheKey}`);
    core.info(`Cache path: ${cachePath}`);
    core.info(`Tarball path: ${tarballPath}`);

    // Ensure the cache directory exists
    if (!fs.existsSync('/caching')) {
      core.info('Creating /caching directory');
      fs.mkdirSync('/caching', { recursive: true });
    }

    // Check if cachePath exists
    if (!fs.existsSync(cachePath)) {
      throw new Error(`Cache path '${cachePath}' does not exist.`);
    }

    core.info('Starting to create tarball...');
    await tar.create(
      {
        gzip: true,
        file: tarballPath,
        cwd: process.cwd(),
      },
      [cachePath]
    );

    // Verify that the tarball was created
    if (!fs.existsSync(tarballPath)) {
      throw new Error(`Failed to create tarball at '${tarballPath}'.`);
    }

    core.info(`Cache saved with key: ${cacheKey}`);
  } catch (error) {
    core.error(`An error occurred: ${(error as Error).message}`);
    core.setFailed((error as Error).message);
  }
}

run();