import config from './config.js';
import KeystoreClient from '../keystore-client.js';
import WalletPolicy from '/libraries/keystore/policies/wallet-policy.js';

(async function() {
    console.log("Keystore client config: ", config);

    const keystoreApi = window.keystoreClient = await KeystoreClient.create(config.keystoreSrc);
    console.log("Keystore client: ", keystoreApi);

	const grantedPolicy = await keystoreApi.getPolicy();
    console.log("grantedPolicy", grantedPolicy);

    const requiredPolicy = new WalletPolicy(1000);
    console.log("requiredPolicy", requiredPolicy);

	if (!requiredPolicy.equals(grantedPolicy)) {
        request.style.display = "block";
        authorize.addEventListener('click', async e => {
            requiredPolicy.limit = ~~limit.value
            console.log("requiredPolicy", requiredPolicy);
        	if (!await keystoreApi.authorize(requiredPolicy)) {
                throw { message: "KeystoreClient: Policies don't match", policies: [requiredPolicy, grantedPolicy] }
            }
            else cont();
        });
    } else cont();
})();

async function cont() {
    console.log("Authorized! Continue...");
    const keystoreApi = window.keystoreClient;
    request.style.display = "none";

    const accounts = await keystoreApi.getAccounts();
    console.log(accounts);
}
