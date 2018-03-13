import config from './config.js';
import KeyguardClient from '../keyguard-client.js';
import WalletPolicy from '/libraries/keyguard/access-control/wallet-policy.js';
import SafePolicy from '/libraries/keyguard/access-control/safe-policy.js';
import * as AccountType from '/libraries/keyguard/accounts/account-type.js';

request.style.display = "none";

async function ensureIsAuthorized(resolve, reject) {
    console.log("Keyguard client config: ", config);

    const keyguardApi = window.keyguardClient = await KeyguardClient.create(config.keyguardSrc);
    console.log("Keyguard client: ", keyguardApi);

	const grantedPolicy = await keyguardApi.getPolicy();
    console.log("granted policy", grantedPolicy);

	if (!grantedPolicy) {
        const requiredPolicy = new SafePolicy();
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

    let accounts = await keyguardApi.getAccounts();

    console.log(`Accounts: ${JSON.stringify(accounts)}`);

    const volatileAccounts = await keyguardApi.createVolatileAccounts(2);

    console.log(`Volatile accounts: ${volatileAccounts}`);

    await keyguardApi.persistAccount(volatileAccounts[0], AccountType.Low);

    accounts = await keyguardApi.getAccounts();

    console.log(`Accounts after persisting first volatile account: ${JSON.stringify(accounts)}`);

})
