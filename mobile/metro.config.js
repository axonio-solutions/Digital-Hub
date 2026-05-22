// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
const repoRoot = path.resolve(projectRoot, '..')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot)

// Let Metro resolve files outside the mobile/ workspace (the web app's src/)
// so runtime imports via the `@web/*` alias work, mirroring tsconfig paths.
config.watchFolders = [repoRoot]

config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...(config.resolver?.extraNodeModules ?? {}),
    '@web': path.resolve(repoRoot, 'src'),
    assert: path.resolve(projectRoot, 'src/lib/assert-polyfill.js'),
  },
  // pnpm hoists deps to the repo root with `node-linker=hoisted`, but Metro
  // still walks node_modules upward — keep both so it finds packages
  // regardless of which level they ended up at.
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(repoRoot, 'node_modules'),
  ],
}

module.exports = config
