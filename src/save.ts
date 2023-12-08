import * as core from '@actions/core';
import * as tar from 'tar';
import * as utils from './utils';
import * as path from 'path';
import * as fs from 'fs';

async function run(): Promise<void> {
  try {
    const cacheKey = core.getState('VIRTUALENV_CACHE_KEY');
    const cachePath = core.getState('VIRTUALENV_DIRECTORY');
    const tarballPath = path.join('/caching', `${cacheKey}.tar`);

    // Ensure the cache directory exists
    if (!fs.existsSync('/caching')) {
      fs.mkdirSync('/caching', { recursive: true });
    }

    await tar.create(
      {
        gzip: true,
        file: tarballPath,
        cwd: process.cwd(),
      },
      [cachePath]
    );

    core.info(`Cache saved with key: ${cacheKey}`);
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run();