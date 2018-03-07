const localConfig = {
    keystoreSrc: `${location.origin}:8080/libraries/keystore`
}

const alternativeConfig = {
    keystoreSrc: `${location.origin}/libraries/keystore/keystore.html`
}

const liveConfig = {
    keystoreSrc: 'https://secure.nimiq.com'
}

export default alternativeConfig;
