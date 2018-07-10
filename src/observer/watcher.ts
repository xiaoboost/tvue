import Component from '../instance';

export type WatcherCb = (newVal: any, oldVal: any) => void;

interface WatcherConOption {
    deep?: boolean;
    computed?: boolean;
    user?: boolean;
}

export type WatcherOption = Pick<WatcherConOption, 'deep'> & {
    immediate?: boolean;
    handler?: WatcherCb;
};

export default class Watcher {
    value: any;

    constructor(
        vm: Component,
        expOrFn: string | WatcherCb,
        cb: WatcherCb,
        options?: WatcherConOption,
        isRenderWatcher?: boolean,
    ) {
        // ..
    }

    update() {
        // ..
    }
    teardown() {
        // ..
    }
}
