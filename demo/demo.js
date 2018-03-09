import config from './config.js';
import KeyguardClient from '../keyguard-client.js';
import WalletPolicy from '/libraries/keyguard/policies/wallet-policy.js';

request.style.display = "none";

async function ensureIsAuthorized(resolve, reject) {
    console.log("Keyguard client config: ", config);

    const keyguardApi = window.keyguardClient = await KeyguardClient.create(config.keyguardSrc);
    console.log("Keyguard client: ", keyguardApi);

	const grantedPolicy = await keyguardApi.getPolicy();
    console.log("granted policy", grantedPolicy);

	if (!grantedPolicy) {
        const requiredPolicy = new WalletPolicy(100);
        console.log("Authorize required policy", requiredPolicy);
        request.style.display = "block";
        authorize.addEventListener('click', async e => {
            request.style.display = "none";
            requiredPolicy.limit = ~~limit.value
            console.log("required policy", requiredPolicy);
        	if (!await keyguardApi.authorize(requiredPolicy)) {
                reject({ message: "Authorize failed.", requiredPolicy });
            }
            else resolve(keyguardApi);
        });
    } else resolve(keyguardApi);
}

new Promise(ensureIsAuthorized).then(async (keyguardApi) => {
    console.log("Authorized! Continue...");

    const accounts = await keyguardApi.getAccounts();
    console.log(accounts);
})
