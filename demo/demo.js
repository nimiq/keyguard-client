import config from './config.js';

import KeystoreClient from '../keystore-client.js';

(async function() {
    window.keyStoreClient = await KeystoreClient.create(config.keystoreSrc);

    console.log(window.keyStoreClient);
})();