import { RPC } from '/libraries/boruca-messaging/src/boruca.js';
import Policy from '/libraries/keyguard/policy.js';

export default class KeyguardClient {
	static async create(src, needUiCallback, usePopup = true) {
		const client = new KeyguardClient(src, needUiCallback, usePopup);
		const wrappedApi = client._wrapApi();
		return wrappedApi;
	}

    /**
	 * @private
	 *
     * @param {function} src URI of secure origin aka key guard aka key dude.
     * @param {function} needUiCallback
     * @param {boolean} usePopup
     */
	constructor(src, needUiCallback, usePopup = true) {
		this._keyguardSrc = src;
		this.popup = usePopup;
		this.$iframe = this._createIframe();
	    this.needUiCallback = needUiCallback || this._defaultUi.bind(this);
	    this.publicApi = {};
		this.policy = null;
	}

	async _wrapApi() {
 		this.embeddedApi = await this._getApi(this.$iframe.contentWindow);
        for (const methodName of this.embeddedApi.availableMethods) {
            const proxy = this._proxyMethod(methodName);
            proxy.secure = this._proxySecureMethod(methodName);
			proxy.isAllowed = () => (this.policy && this.policy.allows(methodName, arguments));
            this.publicApi[methodName] = proxy;
        }

		// intercepting "authorize" and "getPolicy" for keeping an instance of the latest authorized policy
		// to predict if user interaction will be needed when calling API methods.
		const apiAuthorize = this.publicApi.authorize.secure;
		this.publicApi.authorize = async requiredPolicy => {
			const success = await apiAuthorize(requiredPolicy);
			this.policy = success ? requiredPolicy : null;
			return success;
		}

		const apiGetPolicy = this.publicApi.getPolicy;
		this.publicApi.getPolicy = async () => {
			return this.policy = Policy.parse(await apiGetPolicy());
		}

		return this.publicApi;
	}

	/** @param {string} methodName
	 *
	 * @returns {function} Trying to call this method in the iframe and open a window if user interaction is required.
	 * */
	_proxyMethod(methodName) {
		return async (...args) => {
			if (this.policy && !this.policy.allows(methodName, args))
				throw new Error(`Not allowed to call ${methodName}.`);

			const method = this.embeddedApi[methodName].bind(this.embeddedApi);

			// if we know that user interaction is needed, we'll do a secure request, i.e. do a redirect
			if (this.policy && this.policy.needsUi(methodName, args))
				return await method.secure.call(args);

			try {
				return await method(...args);
			}
			catch (error) {
				if (error === 'needs-ui') {
					const confirmed = await this.needUiCallback(methodName);
					if (confirmed) {
							return method.secure.call(args);
					}
					else throw new Error('Denied by user');
				}
				else throw error;
			}
		}
	}

	/** @param {string} methodName
	 *
	 * @returns {function} Call this method in a new window
	 * */
	_proxySecureMethod(methodName) {
		return async (...args) => {
			if (this.popup) { // window.open
				const apiWindow = window.open(this._keyguardSrc);
				if(!apiWindow) throw new Error('Cannot open popup without user action');
				const secureApi = await this._getApi(apiWindow);
				const result = await secureApi[methodName](...args);
				apiWindow.close();
				return result;
			} else { // top level navigation
				const returnTo = encodeURIComponent(window.location);
				//window.location = `${ KeyguardClient.KEYGUARD_URL }?returnTo=${ returnTo }`;
				throw new Error(`Method not implemented: ${methodName}`);
			}
		}
	}

	_defaultUi(methodName) {
		return new Promise((resolve, reject) => { resolve(window.confirm("You will be forwarded to securely confirm this action.")); });
	}

	async _getApi(targetWindow) {
		return await RPC.Client(targetWindow, 'KeyguardApi', (new URL(this._keyguardSrc)).origin);
	}

	_createIframe(src) {
		const $iframe = document.createElement('iframe');
		$iframe.style.display = 'none';
		$iframe.src = this._keyguardSrc;
		$iframe.name = 'keyguard';
		document.body.appendChild($iframe);
		return $iframe;
	}
}