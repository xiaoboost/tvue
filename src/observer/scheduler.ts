import Watcher from './watcher';

// 当前观测器队列
const queue: Watcher[] = []
// 当前观测器队列 hash 表
let has: { [key: number]: boolean } = {};
// 队列正在等待
let waiting = false;
// 正在刷新队列
let flushing = false;
let index = 0;

/**
 * 将观察者推入观察者队列。
 * 拥有相同 ID 的观测器任务会被跳过，
 * 除非此时正在刷新队列
 */
export function queueWatcher(watcher: Watcher) {
    const id = watcher.id;
    if (!has[id]) {
        has[id] = true;
        if (!flushing) {
            queue.push(watcher);
        }
        else {
            // if already flushing, splice the watcher based on its id
            // if already past its id, it will be run next immediately.
            let i = queue.length - 1;
            while (i > index && queue[i].id > watcher.id) {
                i--;
            }
            queue.splice(i + 1, 0, watcher);
        }
        // 刷新队列
        if (!waiting) {
            waiting = true;
            // nextTick(flushSchedulerQueue);
        }
    }
}
