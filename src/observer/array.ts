import { def } from 'src/utils';
import { ObservedObject } from './index';

const arrayProto = Array.prototype;
export const ArrayPrototype = Object.create(arrayProto);

const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse',
];

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach((method) => {
    // cache original method
    const original = arrayProto[method];
    def(ArrayPrototype, method, function mutator(this: ObservedObject, ...args: any[]) {
        const result = original.apply(this, args);
        const ob = this.__ob__;

        let inserted;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
                break;
            default:
        }

        if (inserted) {
            ob.observeArray(inserted);
        }

        // notify change
        ob.dep.notify();
        return result;
    });
});
