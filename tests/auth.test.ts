import assert from 'node:assert/strict';
import {
  isMissingRedirectStateError,
  prefersAuthRedirect,
} from '../src/services/authPlatform';

assert.equal(
  isMissingRedirectStateError(
    new Error(
      'Unable to process request due to missing initial state. This may happen if browser sessionStorage is inaccessible or accidentally cleared.',
    ),
  ),
  true,
);
assert.equal(isMissingRedirectStateError(new Error('auth/popup-blocked')), false);

const originalMatchMedia = globalThis.matchMedia;
const originalNavigator = globalThis.navigator;
const originalWindow = globalThis.window;

function withBrowserEnv(run: () => void) {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: globalThis,
  });
  run();
  if (originalWindow === undefined) {
    Reflect.deleteProperty(globalThis, 'window');
  } else {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
}

function withUserAgent(ua: string, run: () => void) {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { ...originalNavigator, userAgent: ua },
  });
  run();
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: originalNavigator,
  });
}

function withStandalone(standalone: boolean, run: () => void) {
  globalThis.matchMedia = (query: string) =>
    ({
      matches: query.includes('standalone') && standalone,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;

  run();
  globalThis.matchMedia = originalMatchMedia;
}

withBrowserEnv(() => {
  withUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    () => {
      withStandalone(false, () => {
        assert.equal(prefersAuthRedirect(), false);
      });
    },
  );

  withUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    () => {
      withStandalone(false, () => {
        assert.equal(prefersAuthRedirect(), true);
      });
    },
  );

  withUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    () => {
      withStandalone(true, () => {
        assert.equal(prefersAuthRedirect(), true);
      });
    },
  );
});
