/**
 * JWT secret provider.
 *
 * SECURITY: the repository historically shipped a hard-coded default secret
 * ("vibelearn_super_secret_jwt_2026"). Anyone who knows it can forge a token for any
 * role. We therefore NEVER accept that value (or any short value): if JWT_SECRET is
 * missing/weak we generate a strong random secret for this process. Sessions then
 * simply expire on restart instead of being forgeable.
 */
const crypto = require('crypto');

const KNOWN_WEAK = new Set([
  'vibelearn_super_secret_jwt_2026',
  'secret',
  'changeme',
  'your_jwt_secret',
]);

function isStrong(value) {
  return typeof value === 'string' && value.length >= 32 && !KNOWN_WEAK.has(value);
}

let secret = process.env.JWT_SECRET;
let source = 'env';
if (!isStrong(secret)) {
  secret = crypto.randomBytes(48).toString('hex');
  source = 'ephemeral';
  console.warn(
    '[security] JWT_SECRET is missing or weak/known. Using an ephemeral random secret for this process. ' +
    'Set a strong JWT_SECRET (>=32 chars) in the vibelearn-api-secret to keep sessions across restarts.'
  );
}

module.exports = { jwtSecret: secret, jwtSecretSource: source };
