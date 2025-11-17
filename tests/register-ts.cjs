/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const Module = require("module");

const compilerOptions = {
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  target: ts.ScriptTarget.ES2020,
  esModuleInterop: true,
};

const projectRoot = path.resolve(__dirname, "..");

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function patchedResolve(
  request,
  parent,
  isMain,
  options
) {
  if (request.startsWith("@/")) {
    const absolute = path.join(projectRoot, "src", request.slice(2));
    return originalResolveFilename.call(this, absolute, parent, isMain, options);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const compile = (source, filename) => {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions,
    fileName: filename,
    reportDiagnostics: false,
  });
  return outputText;
};

const register = (extension) => {
  require.extensions[extension] = (module, filename) => {
    const source = fs.readFileSync(filename, "utf8");
    const output = compile(source, filename);
    module._compile(output, filename);
  };
};

register(".ts");
register(".tsx");
