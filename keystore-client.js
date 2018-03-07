import { RPC } from '/libraries/boruca-messaging/src/boruca.js';
import Policy from '/libraries/keystore/policy.js';

export default class KeystoreClient {
	static async create(src, needUiCallback, usePopup = true) {
		const client = new KeystoreClient(src, needUiCallback, usePopup);
		const embeddedApi = await KeystoreClient._getApi(client.$iframe.contentWindow)
		const wrappedApi = client.wrapApi(embeddedApi);
		return wrappedApi;
	}

    /**
	 * @private
	 *
     * @param {function} needUiCallback
     * @param {any} api
     * @param {boolean} usePopup
     */
	constructor(src, needUiCallback, usePopup = true) {
		this._keystoreSrc = src;
		this.popup = usePopup;
		this.$iframe = this._createIframe();
	    this.needUiCallback = needUiCallback || this._defaultUi.bind(this);
	    this.publicApi = {};
		this.policy = null;
	}

	wrapApi(embeddedApi) {
 		this.embeddedApi = embeddedApi;
        for (const methodName of this.embeddedApi.availableMethods) {
            let method = this._proxyMethod(methodName);
            method.secure = this._proxySecureMethod(methodName);
			method.isAllowed = () => (!!this.policy && this.policy.allows(methodName, arguments));
            this.publicApi[methodName] = method;
        }

		// keep track of policies
		const apiAuthorize = this.publicApi.authorize.secure.bind(this.publicApi.secure);
		this.publicApi.authorize = async requiredPolicy => {
			const success = apiAuthorize(requiredPolicy);
			this.policy = success ? requiredPolicy : null;
			return success;
		}

		const apiGetPolicy = this.publicApi.getPolicy.bind(this.publicApi);
		this.publicApi.getPolicy = async () => {
			return this.policy = await apiGetPolicy();
		}

		return this.publicApi;
	}

	/** @param {string} methodName
	 *
	 * @returns {function} The proxy method for methodName
	 * */
	_proxyMethod(methodName) {
		return async (...args) => {
			if (this.policy && !this.policy.allows(methodName, args))
				throw `Not allowed to call ${methodName}.`;

			const method = this.embeddedApi[methodName].bind(this.embeddedApi);

			if (this.policy && this.policy.needsUi(methodName, args))
				return await method.secure.call(args);

			try {
				return await method.call(args);
			}
			catch (error) {
				if (error === 'needs-ui') {
					const confirmed = await this.needUiCallback(methodName);
					if (confirmed) {
							return method.secure.call(args);
					}
					else throw 'Denied by user';
				}
				else throw error;
			}
		}
	}

	_proxySecureMethod(methodName) {
		return async (...args) => {
			if (this.popup) { // window.open
				const apiWindow = window.open(this._keystoreSrc);
				const secureApi = await KeystoreClient._getApi(apiWindow);
				const result = await secureApi[methodName](...args);
				apiWindow.close();
				return result;
			} else { // top level navigation
				const returnTo = encodeURIComponent(window.location);
				//window.location = `${ KeystoreClient.KEYSTORE_URL }?returnTo=${ returnTo }`;
				throw "not implemented";
			}
		}
	}

	_defaultUi(methodName) {
		return new Promise((resolve, reject) => { resolve(window.confirm("You will be forwarded to securely confirm this action.")); });
	}

	static async _getApi(origin) {
		return await RPC.Client(origin, 'KeystoreApi');
	}

	_createIframe(src) {
		const $iframe = document.createElement('iframe');
		$iframe.style.display = 'none';
		$iframe.src = this._keystoreSrc;
		$iframe.name = 'keystore';
		document.body.appendChild($iframe);
		return $iframe;
	}
}
