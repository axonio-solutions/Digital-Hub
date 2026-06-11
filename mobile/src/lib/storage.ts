import { Paths, File, Directory } from 'expo-file-system'

let _cacheDir: Directory | null = null
function getCacheDir(): Directory {
  if (!_cacheDir) {
    _cacheDir = new Directory(Paths.cache, 'opencode')
  }
  return _cacheDir
}

export const storage: {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
} = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await new File(getCacheDir(), key).text()
    } catch {
      return null
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    const dir = getCacheDir()
    try {
      dir.create({ intermediates: true })
    } catch {
      // ignore
    }
    await new File(dir, key).write(value)
  },

  async removeItem(key: string): Promise<void> {
    try {
      new File(getCacheDir(), key).delete()
    } catch {
      // ignore
    }
  },
}
