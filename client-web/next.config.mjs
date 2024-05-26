/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        // SERVER_BACKEND: 'http://192.168.72.81:7000/api',
        SERVER_BACKEND: 'http://localhost:7070/api',
        FILE_SERVER: 'http://192.168.72.81:5600/',
        SEARCH_SERVER: 'http://localhost:7300/api',
        VIDEO_SERVER_BACKEND: 'http://localhost:7500/api',
        // VIDEO_SERVER_BACKEND: 'http://0.0.0.0:7500/api',
        LIVE_CHAT_SERVER: 'http://localhost:7070'
    }
}

export default nextConfig
