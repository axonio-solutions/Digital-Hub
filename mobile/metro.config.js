// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot)

// pnpm workspaces rely on symlinks — enable so Metro follows them
config.resolver.unstable_enableSymlinks = true

module.exports = config
