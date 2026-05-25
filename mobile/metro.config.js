// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot)

// Use Expo defaults for watchFolders to avoid conflicts
config.watchFolders = [
  projectRoot,
  require('path').resolve(projectRoot, 'node_modules'),
]

module.exports = config
