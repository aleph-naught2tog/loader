import { someFakeRegistry } from '/vendor/require.index';

console.log(someFakeRegistry);
console.log(window)
window.registry = someFakeRegistry;
