// We have to specify pyodide.js because we need to import that file (not .mjs)
// and 'import' defaults to .mjs
import { loadPyodide, type PyodideInterface } from 'pyodide/pyodide.js';
import pkg from 'pyodide/package.json';

let pyodide: PyodideInterface;

async function setupPyodide() {
  // I tried setting jsglobals here, to provide 'input' and 'print' to python,
  // without having to modify the global window object. However, it didn't work
  // because pyodide needs access to that object. Instead, I used
  // registerJsModule when setting up runPython.
  if (!pyodide) {
    pyodide = await loadPyodide({
      // TODO: host this ourselves
      indexURL: `https://cdn.jsdelivr.net/pyodide/v${pkg.version}/full/`
    });
  }
  return pyodide;
}

self.onmessage = async (e: { data: { code: string } }) => {
  const pyodide = await setupPyodide();
  const { code } = e.data;
  const result = (await pyodide.runPythonAsync(code)) as unknown;
  // self.postMessage(result);
  console.log('result', result);
};
