import VNode from '../vnode';
import { HookFuncExport } from './index';

import {
    isObject,
    isArray,
    isString,
} from 'src/utils';

type ClassOption = NonNullable<VNode['data']['class']>;

/** 连接 class */
function concat(a = '', b = '') {
    return `${a} ${b}`.trim();
}

/** 将输入的 class 选项转换为字符串 */
function stringifyClass(opt: ClassOption) {
    interface ClassObject { [key: string]: boolean; }

    /** 解析 class 对象 */
    function parseClassObject(classObject: ClassObject) {
        return Object.keys(classObject).filter((key) => classObject[key]).join(' ');
    }

    if (isArray(opt)) {
        return opt.map((item) => isString(item) ? item : parseClassObject(item)).join(' ');
    }
    else if (isObject(opt)) {
        return parseClassObject(opt);
    }
    else if (isString(opt)) {
        return opt;
    }
    else {
        return '';
    }
}

function genClassForVnode(vnode: VNode): string {
    let data = vnode.data;
    let parentNode = vnode;
    let childNode = vnode;

    function mergeClassData(child: VNode['data'], parent: VNode['data']): {
        staticClass: string;
        class: ClassOption | undefined;
    } {
        type ArrayClassOption = Extract<ClassOption, any[]>;

        const childClass: ArrayClassOption = child.class
            ? isArray(child.class) ? child.class : [child.class]
            : [];

        const parentClass: ArrayClassOption = parent.class
            ? isArray(parent.class) ? parent.class : [parent.class]
            : [];

        return {
            staticClass: concat(child.staticClass, parent.staticClass),
            class: childClass.concat(parentClass),
        };
    }

    while (childNode.componentInstance) {
        childNode = childNode.componentInstance.$vnode;
        if (childNode && childNode.data) {
            data = mergeClassData(childNode.data, data);
        }
    }

    while (parentNode.parent) {
        parentNode = parentNode.parent;
        if (parentNode && parentNode.data) {
            data = mergeClassData(data, parentNode.data);
        }
    }

    return concat(data.staticClass, stringifyClass(data.class || {}));
}

function updateClass(oldVnode: VNode, vnode: VNode) {
    const el = vnode.elm!;
    const data = vnode.data;
    const oldData = oldVnode.data;

    if (
        !data.staticClass && !data.class &&
        (
            !oldData ||
            (!oldData.staticClass && !oldData.class)
        )
    ) {
        return;
    }

    // set the class
    const newClass = genClassForVnode(vnode);
    const nowClass = el.getAttribute('class');

    if (newClass !== nowClass) {
        el.setAttribute('class', newClass);
    }
}

const classHook: HookFuncExport = {
    create: updateClass,
    update: updateClass,
};

export default classHook;
