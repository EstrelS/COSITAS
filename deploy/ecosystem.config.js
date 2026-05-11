module.exports = {
    apps: [
        {
        name: 'cositas-backend',
        script: './src/index.js',
        cwd: '/home/cositas/backend',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'production',
            PORT: 5000
        },
        error_file: '/var/log/pm2/cositas-error.log',
        out_file: '/var/log/pm2/cositas-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        max_memory_restart: '1G'
        }
    ]
};
