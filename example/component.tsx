import Vue, { Component, Prop, State } from 'tvue';

@Component
export default class App extends Vue {
    @Prop
    input = 'input prop';

    @State
    title = 'input state';
}
