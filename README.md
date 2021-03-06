# Archetyped

[![Build Status](https://travis-ci.org/earthican/archetyped.svg?branch=master)](https://travis-ci.org/earthican/archetyped)

`Archetyped` is a structure for extendable Node.js applications written in
Typescript. Using `Archetyped`, you set up a simple configuration and tell
`Archetyped` which extensions you want to load. Each extension registers
itself with `Archetyped`, so other extensions can use the services it
provides. Extensions can be maintained as NPM packages so they can be
dropped into other `Archetyped` apps.

`Archetyped` is a typed implementation of
[Architect](https://github.com/c9/architect) written in Typescript.

## Status

`Archetyped` is considered to be in open beta and is still undergoing
activate development. There may be some gaps in functionality and the
API may chance, so it is not considered ready for production use.

Use at your own risk.

## Install

```bash
$ npm install archetyped
```

## Demo

To start the `simple-web-server` demo, run

```bash
$ npm run start:http-demo
...
HTTP server listening on http://0.0.0.0:9000
```

The `tests` demo is used to run unit tests. To run:

```bash
$ npm test
```

## Extension Interface

```typescript
import { ArchetypedExtension, ExtensionConfig } from 'archetyped/lib';

export default class Math extends ArchetypedExtension {
  /**
   * [[Archetyped]] Extension constructor interface.
   * @param config Extension configuration that's defined
   *   when configuring [[Archetyped]]
   * @param imports Other extensions that this extension
   *   depends on will be provided through imports.
   */
  constructor(config: ExtensionConfig, imports: any) {
    super(config, imports);
    // Register a service to be exposed to Archetyped
    this.register('math', this);
  }

  /** Methods this service provides **/

  add(x: number, y: number): number {
    return x + y;
  }

  sub(x: number, y: number): number {
    return x - y;
  }

  mult(x: number, y: number): number {
    return x * y;
  }

  div(x: number, y: number): number {
    if (y === 0) throw Error("Can't divide by zero!");
    return x / y;
  }
}
```

Each extension is a node module complete with a package.json file. It
need not actually be in npm, it can be a simple folder in the code tree.

```json
{
  "name": "math",
  "version": "0.0.1",
  "main": "math.js",
  "private": true,
  "archetypeExtension": {
    "provides": ["math"],
    "consumes": []
  }
}
```

## Config Format

The `resolveConfig` function below can read an `Archetyped` config object.
This config object must be a list of `ExtensionConfig` objects.

The demo `simple-web-server` app has a config like this:

```typescript
const appConfig: ArchetypedConfig = [
  {
    packagePath: './extensions/http',
    host: '0.0.0.0',
    port: 9000
  }
];
```

The sample `calculator` app has a config like this:

```typescript
const appConfig: ArchetypedConfig = [
  { packagePath: 'math', trusted: true },
  './extensions/calculator',
];
```

If the only option in the config is `packagePath`, then a string can be
used in place of the object. If you want to pass other options to the
plugin when it's being created, you can put arbitrary properties here.

### Reserved configuration keys

#### `trusted`

If `trusted` is `false` or unspecified (default), the extension will be
loaded inside a sandboxed [Node VM](https://nodejs.org/api/vm.html).
If `trusted` is set to `true`, the extension will run in the context of
the current Node process.
The `trusted` option can also be a function that resolves to a boolean.
Note that this property is strictly compared to `true`, i.e. it must resolve
to `true` and can't just be something truthy:

```js
config.trusted === true
```

#### `key`

The `archetypedExtension` property in each extension's `package.json`
contains information about the `ExtensionManifest`. It will also be
merged in as a prototype to the main config. This is where
`provides` and `consumes` properties are usually set:

```json
// package.json
{
  ...
  "archetypedExtension": {
    "consumes": ['math'],
    "provides": ['calculator']
  }
}
```

Alternatively, `Archetyped` will look for the `ExtensionManifest` if
`key` is set in the `ExtensionConfig`:

```typescript
const appConfig: ArchetypedConfig = [
  { packagePath: 'math', key: 'custom.property' },
];
```

```json
// package.json
{
  ...
  "custom": {
    "property": {
      "consumes": ['math'],
      "provides": ['calculator']
    }
  }
}
```

## `Archetyped` main API

The `archetyped` module exposes two functions as it's main API.

### `createApp(config: ArchetypedConfig, callback?: (err?: Error, app?: Archetyped) => void)`

This function starts an `ArchetypedConfig`. The return value is an
`Archetyped` instance. The optional callback will listen for both
`error` and `ready` on the app object and report on which one happens
first.

### `resolveConfig(config: ArchetypedConfig)`

This is a sync function that loads a config object and parses all the extensions
into a proper config object for use with `createApp`. While this uses sync I/O
all steps along the way are memoized and I/O only occurs on the first
invocation. It's safe to call this in an event loop provided a small set of
`configPaths` are used.

## Class: `Archetyped`

Inherits from `EventEmitter`.

The `createApp` function returns an instance of `Archetyped`.

### Event: `service` (name: `string`, service: `Service`)

When a new service is registered, this event is emitted on the app. Name is the
short name for the service, and service is the actual object with functions.

### Event: `extension` (extension: `ArchetypedExtension`)

When an extension registers, this event is emitted.

### Event: `ready` (app: `Archetyped`)

When all extensions are done, the `ready` event is emitted. The value is the
`Archetyped` instance itself.
