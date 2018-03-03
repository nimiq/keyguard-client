'use strict'

class KeyStoreClient {

	static create(needUiCallback, usePopup = true) {
		const client = new KeyStoreClient(needUiCallback, usePopup);
		return client.publicApi;
	}

	constructor(needUiCallback, usePopup = true) {
		this.popup = usePopup;
		this.iframe = this._createIframe();
		this.embeddedApi = this._getApi(this.iframe);
		this.needUiCallback = needUiCallback || this._defaultUi.bind(this);
		this.publicApi = {};

		for (const methodName in this.embeddedApi) {
			if (this.embeddedApi.hasOwnProperty(methodName)) {
				let method = this._proxyMethod(methodName);
				method.secure = this._proxySecureMethod(methodName);
				this.publicApi[methodName] = method;
			}
		}
	}

	_proxyMethod(methodName) {
		return async () => {
			const method = this.embeddedApi[methodName];

			if (this._willRequireSecure(methodName, arguments))
				return method.secure.call(arguments);

			try {
				return await method.call(arguments);
			}
			catch (error) {
				if (error === 'need-ui') {
					const confirmed = await this.needUiCallback(methodName);
					if (confirmed) {
							return method.secure.call(arguments);
					}
					else throw 'Denied by user';
				}
				else throw error;
			}
		}
	}

	_proxySecureMethod() {
		return async () => {
			if (this.popup) { // window.open
				const apiWindow = window.open(KeyStoreClient.KEYSTORE_URL, "keystore"),
						  secureApi = KeyStoreClient._getApi(apiWindow),
						  result = await secureApi[methodName].call(arguments);
				apiWindow.close();
				return result;
			} else { // top level navigation
				const returnTo = encodeURIComponent(window.location);
				//window.location = `${ KeyStoreClient.KEYSTORE_URL }?returnTo=${ returnTo }`;
				throw "not implemented";
			}
		}
	}

	_willRequireSecure(method, args) {
		return false;
	}

	_defaultUi(methodName) {
		return new Promise((resolve, reject) => { resolve(window.confirm("You will be forwarded to securily confirm this action.")); });
	}

	_getApi(origin) {
		console.log("Not implemented: _getApi");
		return { test: _ => "test", needUi: _ => { if (origin) return "ok!"; throw "need-ui" } };
	}

	_createIframe() {
		console.log("Not implemented: _createIframe");
		let iframe = document.createElement("iframe");
		iframe.style.display="none";
		iframe.src = KeyStoreClient.KEYSTORE_URL;
		iframe.name = "keystore";
		document.body.append(iframe);
		return iframe;
	}
}

KeyStoreClient.KEYSTORE_URL = "https://keystore.nimiq.com";
