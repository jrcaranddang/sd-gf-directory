// Storage helpers: read and write JSON flat files from the storage/ directory

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORAGE_DIR = join(__dirname, '../../storage');

/**
 * Reads a JSON file from the storage/ directory.
 * Returns the parsed object, or `defaultValue` if the file does not exist.
 */
export async function readJSON(filename, defaultValue = {}) {
  const filepath = join(STORAGE_DIR, filename);
  try {
    const contents = await readFile(filepath, 'utf8');
    return JSON.parse(contents);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return defaultValue;
    }
    throw new Error(`Failed to read storage file "${filename}": ${err.message}`);
  }
}

/**
 * Writes data as JSON to the storage/ directory.
 * Creates the storage/ directory if it does not exist.
 */
export async function writeJSON(filename, data) {
  const filepath = join(STORAGE_DIR, filename);
  try {
    if (!existsSync(STORAGE_DIR)) {
      await mkdir(STORAGE_DIR, { recursive: true });
    }
    await writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    throw new Error(`Failed to write storage file "${filename}": ${err.message}`);
  }
}
