const dev = process.env.NODE_ENV === 'development';

export const config = {
  apiEndpoint: dev
    ? 'http://127.0.0.1:5001/deadlibrary-53c38/us-central1/g'
    : 'https://deadlibrary-gw-enb9rt4.uc.gateway.dev/g',
  demoEndpoint: dev
    ? 'http://127.0.0.1:5001/deadlibrary-53c38/us-central1/demoG'
    : 'https://deadlibrary-gw-enb9rt4.uc.gateway.dev/demoG'
};

if (dev) {
  console.log('CLI dev mode - localhost:5001');
}