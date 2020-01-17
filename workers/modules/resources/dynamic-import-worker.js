// This script is meant to be imported by a module worker. It receives a
// message from the worker and responds with the list of imported modules.
const sourcePromise = new Promise(resolve => {
  if ('DedicatedWorkerGlobalScope' in self &&
      self instanceof DedicatedWorkerGlobalScope) {
    self.onmessage = e => {
      // DedicatedWorkerGlobalScope doesn't fill in e.source,
      // so use e.target instead.
      const source = e.source ? e.source : e.target;
      resolve(source);
    };
  } else if ('SharedWorkerGlobalScope' in self &&
      self instanceof SharedWorkerGlobalScope) {
    self.onconnect = e => {
      resolve(e.ports[0]);
    };
  }
});

const importedModulesPromise =
  import('./export-on-load-script.js')
    .then(module => module.importedModules)
    .catch(error => `Failed to do dynamic import: ${error}`);

Promise.all([sourcePromise, importedModulesPromise]).then(results => {
  const [source, importedModules] = results;
  source.postMessage(importedModules);
});
