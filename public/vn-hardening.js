/* Loaded synchronously in <head>, BEFORE the gateway-injected SSO widget (which is deferred).
 * Do not render the "Continue as <name / e-mail>" account chooser on this app: after a sign-out
 * it would disclose the previous user's identity (name, e-mail, avatar) to whoever picks up the
 * device. Sign-in is offered explicitly through the "Login with Lark" button instead. */
window.__VN_SSO_WIDGET_LOADED__ = true;
