import config from './config.js';

import KeystoreClient from '../keystore-client.js';

(async function() {
    console.log("Keystore client config: ", config);

    window.keyStoreClient = await KeystoreClient.create(config.keystoreSrc);

    console.log("Keystore client: ", window.keyStoreClient);
})();
