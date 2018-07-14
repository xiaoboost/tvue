import Component from './index';

import { remove, handleError } from '../utils';

type eventCb = (arg?: any) => any;

export function eventsMixin(Vue: typeof Component) {
    Vue.prototype.$on = function(this: Component, eventName: string | string[], fn: eventCb) {
        if (Array.isArray(eventName)) {
            eventName.forEach((event) => this.$on(event, fn));
        }
        else {
            if (!this._events[eventName]) {
                this._events[eventName] = [];
            }

            this._events[eventName].push(fn);
        }

        return this;
    };

    Vue.prototype.$once = function(this: Component, eventName: string, fn: eventCb) {
        const on = (arg?: any) => {
            this.$off(eventName, on);
            fn.apply(this, arg);
        };

        this.$on(eventName, on);
        return this;
    };

    Vue.prototype.$off = function(this: Component, eventName?: string | string[], fn?: eventCb) {
        // 删除所有事件
        if (!eventName) {
            this._events = Object.create(null);
        }
        // 指定事件名数组
        else if (Array.isArray(eventName)) {
            eventName.forEach((event) => this.$off(event, fn));
        }
        // 指定某事件
        else {
            const cbs = this._events[eventName];

            if (!cbs) {
                return this;
            }

            if (!fn) {
                delete this._events[eventName];
                return this;
            }

            remove(cbs, fn);
        }

        return this;
    };

    Vue.prototype.$emit = function(this: Component, eventName: string, args?: any) {
        const cbs = this._events[eventName];

        if (cbs) {
            for (const fn of cbs) {
                try {
                    fn.apply(this, args);
                }
                catch (e) {
                    handleError(e, this, `event handler for "${event}"`);
                }
            }
        }

        return this;
    };
}
