import config from './config.js';
import KeystoreClient from '../keystore-client.js';
import Policy from '/libraries/keystore/policy.js';

window.Policy = Policy;

(async function() {
    console.log("Keystore client config: ", config);

    const keystoreApi = window.keystoreClient = await KeystoreClient.create(config.keystoreSrc);
    console.log("Keystore client: ", keystoreApi);

	const grantedPolicy = await keystoreApi.getPolicy();
    console.log("grantedPolicy", grantedPolicy);

    const requiredPolicy = Policy.get("spending-limit", 1000);

	if (!requiredPolicy.equals(grantedPolicy)) {
        request.style.display = "block";
        authorize.addEventListener('click', async e => {
            requiredPolicy.limit = ~~limit.value
            console.log("requiredPolicy", requiredPolicy);
        	if (!await keystoreApi.authorize(requiredPolicy)) {
                throw { message: "KeystoreClient: Policies don't match", policies: [requiredPolicy, grantedPolicy, authorizedPolicy] }
            }
            else cont();
        });
    } else cont();
})();

async function cont() {
    console.log("Authorized! Continue...");
    const keystoreApi = window.keystoreClient;
    request.style.display = "none";

    const addresses = await keystoreApi.getAddresses();
    console.log(addresses);
}
