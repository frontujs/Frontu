# Frontu
Frontu is a powerful and flexible library for building reactive web applications with pure HTML and JavaScript. With Frontu, you can easily create dynamic and responsive UIs without the need for JSX or other templating languages. Frontu allows you to bind data to your HTML markup and create reactive components that update in real-time as your data changes. 

## Installation

Frontu has been designed for gradual adoption from the start, and **you can use as little or as much Frontu as you need**:

You can use Frontu as a `<script>` tag from a [CDN](future release), or as a `frontu` package on [npm](https://www.npmjs.com/package/frontu).

## Documentation
Documentation is pending

## Examples

```ts
import * as Frontu  from 'frontu'
import { Another } from './another';

class HelloWorld extends Frontu.Component {

    count = 0;

    constructor(props: any) {
        super(props);
    }
    willMount() {
        this.eventBinding('button', 'click', () => this.onClickButton())
    }

    onClickButton() {
       console.log("Hello world", this.count, this);
       this.count++;
    }
    render() {
        return Frontu.template`
        <h1>Hello world from Frontu</h1>
        <button>
        Clicked ${this.count} ${this.count === 1 ? 'time' : 'times'}
        </button>
        <Another></Another>
        `;
    }
}

Frontu.declareComponent(HelloWorld, "HelloWorld");

Frontu.render(new HelloWorld({}), document.getElementById("root"))
```

This example will render a button with the text "Clicked 0 times" into a container on the page.
