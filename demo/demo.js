import config from './config.js';
import KeyguardClient from '../keyguard-client.js';
import WalletPolicy from '/libraries/keyguard/policies/wallet-policy.js';

(async function() {
    console.log("Keyguard client config: ", config);

    const keyguardApi = window.keyguardClient = await KeyguardClient.create(config.keyguardSrc);
    console.log("Keyguard client: ", keyguardApi);

	const grantedPolicy = await keyguardApi.getPolicy();
    console.log("grantedPolicy", grantedPolicy);

    const requiredPolicy = new WalletPolicy(1000);
    console.log("requiredPolicy", requiredPolicy);

	if (!requiredPolicy.equals(grantedPolicy)) {
        request.style.display = "block";
        authorize.addEventListener('click', async e => {
            requiredPolicy.limit = ~~limit.value
            console.log("requiredPolicy", requiredPolicy);
        	if (!await keyguardApi.authorize(requiredPolicy)) {
                throw { message: "KeystoreClient: Policies don't match", policies: [requiredPolicy, grantedPolicy] }
            }
            else cont();
        });
    } else cont();
})();

async function cont() {
    console.log("Authorized! Continue...");
    const keyguardApi = window.keyguardClient;
    request.style.display = "none";

    const accounts = await keyguardApi.getAccounts();
    console.log(accounts);
}
