const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openRuneLite: () => ipcRenderer.send('open-runelite'),
    hasUpdates: () => ipcRenderer.send('has-Updates'),
    installUpdates: () => ipcRenderer.send('install-Updates'),
    installUpdates: () => ipcRenderer.send('latest-'),
    getLatestVersion: async () => {
        const version = await ipcRenderer.invoke('get-lastVersion');
        return version;
    },
    hasInjector: async () => {
        const hasInjector = await ipcRenderer.invoke('has-Injector');
        return hasInjector;
    },
    hasPlugins: async (latest) => {
        const hasPlugins = await ipcRenderer.invoke('has-Plugins', latest);
        return hasPlugins;
    },
    installInjector: async () => {
        const hasPlugins = await ipcRenderer.invoke('install-Injector');
        return hasPlugins;
    },
    installPlugins: async (latest) => {
        const plugins = await ipcRenderer.invoke('install-Plugins',latest);
        return plugins;
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});
