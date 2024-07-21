const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const https = require('https');

let mainWindow;

const GIT_Token = process.env.GIT_TOKEN ? process.env.GIT_TOKEN : null;

var latestVersion;

const userDir = os.homedir();
// Injector
const injectorPath = path.join(userDir, 'AppData', 'Local', 'RuneLite', 'EthanVannInstaller.jar');
const configInjectorPath = path.join(userDir, 'AppData', 'Local', 'RuneLite', 'config.json');

// Plugins
const externalPluginsDir = path.join(userDir, '.runelite', 'externalplugins');
const pluginPath = path.join(externalPluginsDir, `${latestVersion}.jar`);

// Runelite
const runelitePath = path.join(userDir, 'AppData', 'Local', 'RuneLite', 'RuneLite.exe');

// URLs
const injectorLink = 'https://raw.githubusercontent.com/LcsPlugins/runelite-plugins/master/EthanVannInstaller.jar';
const configInjectorLink = 'https://raw.githubusercontent.com/LcsPlugins/runelite-plugins/master/config.json';

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        icon: path.join(__dirname, 'build', 'icons', 'icon.png'),
        webPreferences: {
            webSecurity: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    const startUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080'
        : `app://./index.html`;

    mainWindow.loadURL(startUrl);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', async () => {
    // Register the custom protocol
    protocol.registerFileProtocol('app', (request, callback) => {
        const url = request.url.substr(6); // Strip off 'app://'
        callback({ path: path.normalize(`${__dirname}/${url}`) });
    }, (error) => {
        if (error) console.error('Failed to register protocol');
    });

    createWindow();
    await getLatestVersion();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.handle('get-lastVersion', async () => {
    return await getLatestVersion();
});

// Listener IPC para abrir o RuneLite
ipcMain.on('open-runelite', () => {
    exec(`"${runelitePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro ao iniciar o RuneLite: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

    // Fechar a janela principal
    if (mainWindow) {
        mainWindow.close();
    }
});

ipcMain.handle('has-Injector', async () => {
    return fs.existsSync(injectorPath);
});

ipcMain.handle('install-Injector', function hasInjector() {
    if (!fs.existsSync(injectorPath)) {
        downloadFile(configInjectorLink, configInjectorPath);
        return downloadFile(injectorLink, injectorPath);
    }
});

ipcMain.handle('install-Plugins', async (event, latest) => {
    const releaseUrl = `https://raw.githubusercontent.com/LcsPlugins/runelite-plugins/master/releases/${latest}.jar`;
    const pluginPath = path.join(externalPluginsDir, `${latest}.jar`);
    if (!fs.existsSync(externalPluginsDir)) {
        fs.mkdirSync(externalPluginsDir, { recursive: true });
    }
    downloadFile(releaseUrl, pluginPath);
});

ipcMain.handle('has-Plugins', async (event, latest) => {
    var pluginPath1 = path.join(externalPluginsDir, `${latest}.jar`);
    return fs.existsSync(externalPluginsDir) && fs.existsSync(pluginPath1);
});

async function getLatestVersion() {
    const versionUrl = 'https://raw.githubusercontent.com/LcsPlugins/runelite-plugins/master/version.json?';

    return new Promise((resolve, reject) => {
        https.get(versionUrl, {
            headers: {
                'Authorization': `token ${GIT_Token}`
            }
        }, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    latestVersion = jsonData;
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (err) => {
            reject(`Erro ao verificar a versão dos plugins: ${err.message}`);
        });
    });
}

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        // Ensure the directory exists
        const dir = path.dirname(dest);
        fs.mkdir(dir, { recursive: true }, (err) => {
            if (err) {
                reject(`Failed to create directory: ${err.message}`);
                return;
            }

            const file = fs.createWriteStream(dest);
            https.get(url, {
                headers: {
                    'Authorization': `token ${GIT_Token}`
                }
            }, (response) => {
                if (response.statusCode !== 200) {
                    reject(`Failed to get '${url}' (${response.statusCode})`);
                    return;
                }

                response.pipe(file);

                file.on('finish', () => {
                    file.close(() => {
                        resolve('Download complete');
                    });
                });
            }).on('error', (err) => {
                fs.unlink(dest, () => reject(err.message));
            });
        });
    });
}
