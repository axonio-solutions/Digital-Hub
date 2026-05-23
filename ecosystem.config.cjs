const fs = require('fs')

function parseEnv(filePath) {
  try {
    return Object.fromEntries(
      fs
        .readFileSync(filePath, 'utf8')
        .split('\n')
        .filter((l) => l.trim() && !l.startsWith('#') && l.includes('='))
        .map((l) => {
          const i = l.indexOf('=')
          return [
            l.slice(0, i).trim(),
            l
              .slice(i + 1)
              .trim()
              .replace(/^"|"$/g, ''),
          ]
        }),
    )
  } catch {
    return {}
  }
}

const env = parseEnv('/home/ubuntu/mlila/.env')

module.exports = {
  apps: [
    {
      name: 'mlila',
      script: '.output/server/index.mjs',
      cwd: '/home/ubuntu/mlila',
      instances: 2,
      autorestart: true,
      watch: false,
      env,
    },
  ],
}
