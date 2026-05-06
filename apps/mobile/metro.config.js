const path = require("node:path");
const fs = require("node:fs");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const packagesRoot = path.resolve(workspaceRoot, "packages");
const routerRealPath = fs.realpathSync(path.resolve(projectRoot, "node_modules/expo-router"));
const metroRuntimeRealPath = fs.realpathSync(path.resolve(projectRoot, "node_modules/@expo/metro-runtime"));
const workspaceNodeModules = path.resolve(workspaceRoot, "node_modules");

const config = getDefaultConfig(projectRoot);

// Monorepo setup: watch only shared packages to keep file watchers bounded.
// Dependencies are still resolved from both local and workspace node_modules
// via nodeModulesPaths below.
config.watchFolders = [packagesRoot, workspaceNodeModules, routerRealPath, metroRuntimeRealPath];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.extraNodeModules = {
  "expo-router": routerRealPath,
  "@expo/metro-runtime": metroRuntimeRealPath,
};
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
