const localConfig = {
    keyguardSrc: `${location.origin}:8080/libraries/keyguard`
}

const alternativeConfig = {
    keyguardSrc: `${location.origin}/libraries/keyguard/keyguard.html`
}

const liveConfig = {
    keyguardSrc: 'https://secure.nimiq.com'
}

export default alternativeConfig;
