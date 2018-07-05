import { stateMixin } from './state';

export default class Vuetc {
    // 组件属性
    $options!: ComponentOptions;

    // 内部私有数据
    _data: { [stateName: string]: any } = {};
    _props: { [propName: string]: any } = {};

    // 内部私有状态量定义
    _isMounted = false;
    _isDestroyed = false;
    _isBeingDestroyed = false;
}

export interface ComponentOptions {
    name?: string;
    components?: { [componentName: string]: typeof Vuetc };
    props?: string[];
    data?: string[];
}

stateMixin(Vuetc);
