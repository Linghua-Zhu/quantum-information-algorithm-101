# Development

The course is built from the files in `src/` into one page, `docs/index.html`, which GitHub Pages serves.

## Build

```
python3 build.py
```

## Tests

The browser tests use Playwright and axe-core. Build the page first.

```
npm install
npx playwright install chromium
npm test
```

The Code page writes Qiskit scripts. To run a set of them with Qiskit and compare the results with the page's own numbers:

```
pip install qiskit qiskit-aer qiskit-ibm-runtime
node test/gen_cases.js cases.json
python3 test/verify_code.py cases.json
```

## Source files

| File | Contents |
|---|---|
| `src/core.js` | Vectors, rotations and gates |
| `src/items.js` | Practice items and their feedback |
| `src/paulis.js` | Pauli operators and Pauli strings: practice items and their checks |
| `src/sphere.js` | The Bloch sphere figure |
| `src/content.js` | Course map, goals, Start here and Discuss |
| `src/codegen.js` | Qiskit and OpenQASM output |
| `src/app.js` | Pages, saved progress and the review schedule |
| `src/shell.html` | Page markup |
| `src/style.css` | Styles |
