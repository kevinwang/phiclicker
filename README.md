# &phi;>clicker
CS 411 group project: real-time audience response system, but for free.

## Team `TBD');DROP TABLE Projects;--`
- Kevin Wang <klwang3@illinois.edu>
- Matthew Hyder <mlhyder2@illinois.edu>
- Austin Chung <achung13@illinois.edu>

## Dev instructions
```bash
npm install
npm start
```

Server and client-side JavaScript packages will restart/rebuild automatically when source files are modified.

## JavaScript packages
We will organize our client-side JS into packages, each of which bundle into a single `.js` file. To create a new JavaScript package, create a new directory `javascript/*-package` and create an `index.js` underneath it. Add the package to the `packages` array near the top of `gulpfile.js`.

`index.js` is the main file in the package. Use `require` as you would in Node.js to load other files and modules. The package is bundled using Browserify and saved to `public/js/*-package.js`, which is served at `/static/js/*-package.js`.