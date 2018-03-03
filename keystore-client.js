'use strict'

class KeyStoreClient {
	
	static create(needUiCallback) {
		const embeddedApi = KeyStoreClient._getApi(KeyStoreClient._createIframe());
		needUiCallback = needUiCallback || KeyStoreClient._defaultUi.bind(this);
		
		let client = {};
		for (let method in embeddedApi) {
			if (embeddedApi.hasOwnProperty(method))
				client[method] = KeyStoreClient._proxyMethod(method, embeddedApi, needUiCallback);
		}
		return client;
	}

	static _proxyMethod(method, embeddedApi, needUiCallback) {
		return async () => {
			try {
				return embeddedApi[method].call(arguments);
			} catch (error) {
				if (error === "need-ui") { 
					let confirmed = await needUiCallback(method);
					if (confirmed) {
						try {
							let apiWindow = window.open(KeyStoreClient.KEYSTORE_URL, "keystore"),
							    secureApi = KeyStoreClient._getApi(apiWindow);
							let result = await secureApi[method].call(arguments);
							apiWindow.close();
							return result;
						} catch (error) {
							console.log(error);
							throw error;
						}
					} 
					else throw "Denied by user";
				}
				else throw error;
			}
		}
	}
	
	static _defaultUi(method) {
		return new Promise((resolve, reject) => { resolve(window.confirm(`Confirm "${ method }"`)); });
	}

	
	static _getApi(origin) {
		console.log("Not implemented: _getApi");
		return { test: _ => "test", needUi: _ => { if (origin) return "ok!"; throw "need-ui" } };
	}
	
	static _createIframe() {
		console.log("Not implemented: _createIframe");
		return null;
	}
}

KeyStoreClient.KEYSTORE_URL = "https://keystore.nimiq.com";
