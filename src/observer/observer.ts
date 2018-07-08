import Dep from './dep';

export interface ObservedObject {
    __ob__: Observer;
    _isVue: boolean;
    [key: string]: any;
}

export default class Observer {
    value: any;
    dep = new Dep();
    vmCount = 0; // number of vms that has this object as root $data

    constructor(value: any) {
        this.value = value;
    }

    walk(obj: object) {
        // ..
    }

    observeArray(items: any[]) {
        // ..
    }
}
