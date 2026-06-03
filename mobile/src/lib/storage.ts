import { Paths, File, Directory } from 'expo-file-system'

const CACHE_DIR = new Directory(Paths.cache, 'opencode')

export const storage: {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
} = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await new File(CACHE_DIR, key).text()
    } catch {
      return null
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      CACHE_DIR.create({ intermediates: true })
    } catch {
      // ignore
    }
    new File(CACHE_DIR, key).write(value)
  },

  async removeItem(key: string): Promise<void> {
    try {
      new File(CACHE_DIR, key).delete()
    } catch {
      // ignore
    }
  },
}
