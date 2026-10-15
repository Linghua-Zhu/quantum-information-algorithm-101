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

The Code page of Unit 0 writes NumPy scripts. To run a set of them and compare the output with the page's own expected output:

```
pip install numpy
node test/gen_cases0.js cases0.json
python3 test/verify_code0.py cases0.json
```

## Source files

| File | Contents |
|---|---|
| `src/core.js` | Vectors, rotations and gates |
| `src/items.js` | Practice items and their feedback |
| `src/paulis.js` | Pauli operators and Pauli strings: practice items and their checks |
| `src/sphere.js` | The Bloch sphere figure |
| `src/plane.js` | The grid figure for Unit 0, and the slot that holds a sphere and a plane |
| `src/unit0.js` | Unit 0 practice items and their checks |
| `src/content.js` | Course map, and the goals, Start here and Discuss of Unit 1 |
| `src/content0.js` | Goals, Start here and Discuss of Unit 0, and the list of units |
| `src/codegen.js` | Qiskit, OpenQASM and NumPy output |
| `src/app.js` | Pages, saved progress and the review schedule |
| `src/shell.html` | Page markup |
| `src/style.css` | Styles |
