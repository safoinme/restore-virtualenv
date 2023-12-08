import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';
import * as utils from './utils';
import * as tar from 'tar';
import * as fs from 'fs';

async function run(): Promise<void> {
  try {
    const requirementFiles = core.getInput('requirement_files', { required: true });
    const customCacheKey = core.getInput('custom_cache_key_element', { required: true });
    const customVirtualenvDir = core.getInput('custom_virtualenv_dir', { required: true });

    const virtualenvDir = await utils.virtualenv_directory(customVirtualenvDir);
    core.saveState('VIRTUALENV_DIRECTORY', virtualenvDir);
    core.setOutput('virtualenv-directory', virtualenvDir);

    const cacheKey = await utils.cache_key(requirementFiles, customCacheKey);
    core.saveState('VIRTUALENV_CACHE_KEY', cacheKey);
    core.info(`cache key: ${cacheKey}`);
    core.info(`directory to cache: ${virtualenvDir}`);

    const tarballPath = path.join('/caching', `${cacheKey}.tar`);

    if (fs.existsSync(tarballPath)) {
      await tar.extract({
        file: tarballPath,
        cwd: process.cwd(),
      });

      core.info(`Cache restored from key: ${cacheKey}`);
      core.setOutput('cache-hit', true.toString());
    } else {
      core.info('Cache not found. creating new virtualenv');
      core.setOutput('cache-hit', false.toString());

      await exec.exec('python', ['-m', 'venv', virtualenvDir]);
    }

    // do what venv/bin/activate normally does
    core.exportVariable('VIRTUAL_ENV', virtualenvDir);

    if (process.platform === 'win32') {
      core.addPath(`${virtualenvDir}${path.sep}Scripts`);
    } else {
      core.addPath(`${virtualenvDir}${path.sep}bin`);
    }
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run();