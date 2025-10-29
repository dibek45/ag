const production = true;

export const environment = {
  production,

  socketUrl: 'wss://api.sorteos.sa.dibeksolutions.com',

    apiUrl: production
    ? 'https://api.sorteos.sa.dibeksolutions.com/graphql'
    : 'http://localhost:3000/graphql',
};
