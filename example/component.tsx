import Vue, { Component, Prop, State } from '../src';

@Component
export default class App extends Vue {
    @Prop
    input = 'input prop';

    @State
    title = 'input state';
}
