import config from './config.js';
import KeyguardClient from '../keyguard-client.js';
import WalletPolicy from '/libraries/keyguard/access-control/wallet-policy.js';
import SafePolicy from '/libraries/keyguard/access-control/safe-policy.js';
import Policy from '/libraries/keyguard/access-control/policy.js';
import * as Keytype from '/libraries/keyguard/keys/keytype.js';

request.style.display = "none";

/*function ensureIsAuthorized() {
   if (!assumedPolicy.equals(grantedPolicy)) {
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
    } else resolve(keyguardApi);*/

(async function () {
    console.log("Keyguard client config: ", config);

    const keyguardApi = window.keyguardClient = await KeyguardClient.create(config.keyguardSrc, new SafePolicy());
    console.log("Keyguard client: ", keyguardApi);

    console.log("Authorized! Continue...");

    let accounts = await keyguardApi.get();

    console.log(`Accounts: ${JSON.stringify(accounts)}`);

    /*const volatileAccounts = await keyguardApi.createVolatile(2);

    console.log(`Volatile accounts: ${volatileAccounts}`);

    await keyguardApi.persist(volatileAccounts[0], Keytype.Low);

    accounts = await keyguardApi.get();

    console.log(`Accounts after persisting first volatile account: ${JSON.stringify(accounts)}`);*/
})();
