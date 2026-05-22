module.exports = {
  apps: [
    {
      name: 'mlila',
      script: '.output/server/index.mjs',
      instances: 1,
      autorestart: true,
      watch: false,
      env_file: '.env',
    },
  ],
}
