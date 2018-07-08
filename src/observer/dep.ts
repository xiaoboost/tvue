import Watcher from './watcher';
import { remove } from 'src/utils';

let uid = 0;

export default class Dep {
    id = uid++;
    subs: Watcher[] = [];

    addSub(sub: Watcher) {
        this.subs.push(sub);
    }
    removeSub(sub: Watcher) {
        remove(this.subs, sub);
    }
    notify() {
        this.subs.slice().forEach((sub) => sub.update());
    }
}
