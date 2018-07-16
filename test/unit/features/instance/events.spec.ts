import Vue from 'tvue';

describe('Instance methods events', () => {
    let vm: Vue, spy: jest.Mock;

    beforeEach(() => {
        vm = new Vue();
        spy = jest.fn();
    });

    test('$on', () => {
        vm.$on('test', function(this: Vue) {
            expect(this).toBe(vm);
            spy.apply(this, arguments);
        });

        vm.$emit('test', 1, 2, 3, 4);
        expect(spy.mock.calls.length).toBe(1);
        expect(spy).toHaveBeenCalledWith(1, 2, 3, 4);
    });

    test('$on multi event', () => {
        vm.$on(['test1', 'test2'], function(this: Vue) {
            expect(this).toBe(vm);
            spy.apply(this, arguments);
        });

        vm.$emit('test1', 1, 2, 3, 4);
        expect(spy.mock.calls.length).toBe(1);
        expect(spy).toHaveBeenCalledWith(1, 2, 3, 4);

        vm.$emit('test2', 5, 6, 7, 8);
        expect(spy.mock.calls.length).toBe(2);
        expect(spy).toHaveBeenCalledWith(5, 6, 7, 8);
    });

    test('$off multi event', () => {
        vm.$on(['test1', 'test2', 'test3'], spy);
        vm.$off(['test1', 'test2'], spy);
        vm.$emit('test1');
        vm.$emit('test2');
        expect(spy).not.toHaveBeenCalled();

        vm.$emit('test3', 1, 2, 3, 4);
        expect(spy.mock.calls.length).toBe(1);
    });

    test('$off multi event without callback', () => {
        vm.$on(['test1', 'test2'], spy);
        vm.$off(['test1', 'test2']);
        vm.$emit('test1');
        expect(spy).not.toHaveBeenCalled();
    });

    test('$once', () => {
        vm.$once('test', spy);
        vm.$emit('test', 1, 2, 3);
        vm.$emit('test', 2, 3, 4);
        expect(spy.mock.calls.length).toBe(1);
        expect(spy).toHaveBeenCalledWith(1, 2, 3);
    });

    test('$off', () => {
        vm.$on('test1', spy);
        vm.$on('test2', spy);
        vm.$off();
        vm.$emit('test1');
        vm.$emit('test2');

        expect(spy).not.toHaveBeenCalled();
    });

    test('$off event', () => {
        vm.$on('test1', spy);
        vm.$on('test2', spy);
        vm.$off('test1');
        vm.$off('test1');
        vm.$emit('test1', 1);
        vm.$emit('test2', 2);

        expect(spy.mock.calls.length).toBe(1);
        expect(spy).toHaveBeenCalledWith(2);
    });

    test('$off event + fn', () => {
        const spy2 = jest.fn();
        vm.$on('test', spy);
        vm.$on('test', spy2);
        vm.$off('test', spy);
        vm.$emit('test', 1, 2, 3);

        expect(spy).not.toHaveBeenCalled();
        expect(spy2.mock.calls.length).toBe(1);
        expect(spy2).toHaveBeenCalledWith(1, 2, 3);
    });
});
