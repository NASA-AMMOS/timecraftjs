### Modularize cspice.js

- Add `module.exports` line to `cspice.js`:

```js
exports.modules = Module;
```

### Modularize spice.js

- Remove `setup` function and import `cspice.js` (`fs` import is not needed?):

```js
s.Module = require( './cspice.js' );
s.FS = s.Module.get_fs();
```

- Expose _only_ wrapper functions for CSpice on the class.
- Use a class notation or export all CSpice functions as individual function exports to afford some code culling.
- Consider auto-generating 

### Node / Browser support

- Remove timecraft.js.
- Create `browser.js` and `node.js` script files that implement appropriate async furnish from file functions that use `fetch` or `fs` as needed and delegate to furnishing from buffer.
- Set `browser` and `module` / `main` fields to `browser.js` and `node.js` respectively.

### Reorganization

- Remove preload, postinstall, etc functions.
- Move all source files to `src/`.
- Move all example code to `example/`.
- Add .gitignore

### Global Script Support

- If required build a UMD and module variant of the src using Rollup.

### Example

- Create an example that demonstrates use of extracting planet position, sun position, and conversion to and frame ETC, LMST, UTC, SCLK, and back.