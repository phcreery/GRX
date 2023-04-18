# GRX

Gerber Viewer with 3d support and beautiful finished board rendering

#### !! DEVELOPMENT !!

See the current build in production here => [GRX](http://grx.creery.org)

![homepage](/doc/full.gif)

## About

Front-End & Back-End Repository for GRX.

Front end is a single-page React App that utilizes advanced libraries including Three.js and TraceSpace. These combined create an awesome 3D gerber viewer.

## For All-In-One Production

### Install Dependencies

Install dependencies for both frontend and backend

### Edit .env files for each side

Frontend `/frontend/.env`
Backend `/backend/.env`

### Build Frontend into Production

In `/frontend` run `npm run build`

#### Install pm2

```
npm install pm2 -g
```

#### Start pm2

```
pm2 start pm2.config.json
```


## TODO

npm dependency improvements
```
npm WARN deprecated hast@1.0.0: Renamed to rehype
npm WARN deprecated source-map-url@0.4.1: See https://github.com/lydell/source-map-url#deprecated
npm WARN deprecated stable@0.1.8: Modern JS already guarantees Array#sort() is a stable sort, so this library is deprecated. See the compatibility table on MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#browser_compatibility
npm WARN deprecated urix@0.1.0: Please see https://github.com/lydell/urix#deprecated
npm WARN deprecated rollup-plugin-terser@7.0.2: This package has been deprecated and is no longer maintained. Please use @rollup/plugin-terser
npm WARN deprecated source-map-resolve@0.5.3: See https://github.com/lydell/source-map-resolve#deprecated
npm WARN deprecated resolve-url@0.2.1: https://github.com/lydell/resolve-url#deprecated
npm WARN deprecated sourcemap-codec@1.4.8: Please use @jridgewell/sourcemap-codec instead
npm WARN deprecated w3c-hr-time@1.0.2: Use your platform's native performance.now() and performance.timeOrigin.
npm WARN deprecated asar@3.2.0: Please use @electron/asar moving forward.  There is no API change, just a package name change
npm WARN deprecated querystring@0.2.0: The querystring API is considered Legacy. new code should use the URLSearchParams API instead.
npm WARN deprecated electron-osx-sign@0.6.0: Please use @electron/osx-sign moving forward. Be aware the API is slightly different
npm WARN deprecated uglify-es@3.3.9: support for ECMAScript is superseded by `uglify-js` as of v3.13.0
npm WARN deprecated svgo@1.3.2: This SVGO version is no longer supported. Upgrade to v2.x.x.
```