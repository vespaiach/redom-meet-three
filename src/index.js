import { mount, el } from 'redom';

class App {
    constructor() {
        this.el = (
            <div>
                <h1>Hello</h1>
            </div>
        );
    }
    onmount() {
        console.log('mounted');
    }
}

mount(document.body, new App());
