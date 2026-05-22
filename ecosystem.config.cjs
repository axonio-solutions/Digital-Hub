module.exports = {
  apps: [
    {
      name: 'mlila',
      script: 'dist/server/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env_file: '.env',
    },
  ],
}
