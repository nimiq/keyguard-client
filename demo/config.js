const localConfig = {
    keystoreSrc: `${location.origin}:8080/libraries/keystore`,
    networkOrigin: location.origin
}

const liveConfig = {
    keystoreSrc: 'https://secure.nimiq.com',
    networkSrc: 'https://network.nimiq.com'
}

export default localConfig;
