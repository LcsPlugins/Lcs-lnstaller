module.exports =
{
    configureWebpack: {
        target: 'web',
    },
    transpileDependencies: [
        "electron"
    ],
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: './src/background.js',
            preload: 'public/preload.js',
            builderOptions: {
                appId: 'dev.lucasmachado.lcspluginsinstaller',
                productName: 'LcsPlugins',
                directories: {
                    buildResources: 'public'
                },
                win: {
                    icon: 'build/icons/icon.png'
                }
            },

        },
    },
};


