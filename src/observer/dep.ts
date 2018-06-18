import Watcher from './watcher';
import { remove } from 'src/utils';

let uid = 0;

export default class Dep {
    static target?: Watcher;

    id = uid++;
    subs: Watcher[] = [];

    addSub(sub: Watcher) {
        this.subs.push(sub);
    }
    removeSub(sub: Watcher) {
        remove(this.subs, sub);
    }
    depend() {
        if (Dep.target) {
            Dep.target.addDep(this);
        }
    }
    notify() {
        this.subs.slice().forEach((sub) => sub.update());
    }
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = undefined;
const targetStack: Watcher[] = [];

export function pushTarget(_target?: Watcher) {
    Dep.target && targetStack.push(Dep.target);
    Dep.target = _target;
}

export function popTarget() {
    Dep.target = targetStack.pop();
}
