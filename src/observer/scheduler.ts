import Watcher from './watcher';

// 当前观测器队列
const queue: Watcher[] = [];
// 当前观测器队列 hash 表
const has: { [key: number]: boolean } = {};
// 队列正在等待
// let waiting = false;
// 正在刷新队列
// let flushing = false;
// let index = 0;

/**
 * 将观察者推入观察者队列。
 * 拥有相同 ID 的观测器任务会被跳过，
 * 除非此时正在刷新队列
 */
export function queueWatcher(watcher: Watcher) {
    // ..
}
