import config from './config.js';
import KeystoreClient from '../keystore-client.js';
import Policy from '/libraries/keystore/policy.js';

(async function() {
    console.log("Keystore client config: ", config);

    const keystoreApi = window.keystoreClient = await KeystoreClient.create(config.keystoreSrc);
    console.log("Keystore client: ", keystoreApi);

    const limit = 1000;
    const requiredPolicy = Policy.get("full", [ limit ]);
	const grantedPolicy = await keystoreApi.getPolicy();

	if (!requiredPolicy.equals(grantedPolicy)) {
    	const authorizedPolicy = await keystoreApi.authorize(requiredPolicy);
    	if (!requiredPolicy.equals(authorizedPolicy))
            throw { message: "KeystoreClient: Policies don't match", policies: [requiredPolicy, grantedPolicy, authorizedPolicy] }
    }

    const addresses = keystoreApi.getAddresses();
    console.log(addresses);
})();
