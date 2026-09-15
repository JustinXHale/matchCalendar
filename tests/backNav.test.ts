import assert from 'node:assert/strict';
import {
  appBackLabel,
  backState,
  goAppBack,
  readBackNav,
} from '../src/nav/backNav';

const fallback = { to: '/schedule', label: 'Schedule' };

assert.deepEqual(
  readBackNav(backState({ to: '/money', label: 'Money' })),
  { to: '/money', label: 'Money' },
);
assert.equal(readBackNav(null), null);
assert.equal(readBackNav({ back: { to: '', label: 'x' } }), null);

assert.equal(
  appBackLabel(backState({ to: '/money', label: 'Money' }), fallback),
  'Back to Money',
);

const navigated: unknown[] = [];
const navigate = (...args: unknown[]) => {
  navigated.push(args);
};

goAppBack(navigate as never, {
  fallback,
  fromState: backState({ to: '/money', label: 'Money' }),
});
assert.deepEqual(navigated, [['/money', undefined]]);

goAppBack(navigate as never, { fallback, fromState: null });
assert.deepEqual(navigated[1], ['/schedule', undefined]);

console.log('Back navigation helper checks passed.');
