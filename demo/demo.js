import config from './config.js';
import KeyguardClient from '../keyguard-client.js';
import WalletPolicy from '/libraries/keyguard/policies/wallet-policy.js';

request.style.display = "none";

(async function() {
    console.log("Keyguard client config: ", config);

    const keyguardApi = window.keyguardClient = await KeyguardClient.create(config.keyguardSrc);
    console.log("Keyguard client: ", keyguardApi);

	const grantedPolicy = await keyguardApi.getPolicy();
    console.log("grantedPolicy", grantedPolicy);

	if (!requiredPolicy.equals(grantedPolicy)) {
        const requiredPolicy = new WalletPolicy(100);
        console.log("requiredPolicy", requiredPolicy);

        console.log("Didn't get the right policy", grantedPolicy);
        request.style.display = "block";
        authorize.addEventListener('click', async e => {
            requiredPolicy.limit = ~~limit.value
            console.log("requiredPolicy", requiredPolicy);
        	if (!await keyguardApi.authorize(requiredPolicy)) {
                throw { message: "KeyguardClient: Policies don't match", policies: [requiredPolicy, grantedPolicy] }
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
