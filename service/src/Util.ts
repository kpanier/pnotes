export function getSecret(): string {
    if (process.env.secret) {
        console.log('Configured secret is used.');
        return process.env.secret
    }
    return 'secret'
}
