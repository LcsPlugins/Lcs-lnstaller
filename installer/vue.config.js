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
            preload: './src/preload.js',
            builderOptions: {
                appId: 'dev.lucasmachado.lcspluginsinstaller',
                productName: 'LcsPlugins',
                directories: {
                    output: 'dist_electron', // Diretório onde os arquivos serão gerados
                    buildResources: 'public', // Diretório para recursos de construção (ícones, etc.)
                },
                win: {
                    icon: 'build/icons/icon.png'
                },
                extraFiles: [
                    {
                        "from": "public/",
                        "to": "resources"
                    }
                ]
            },

        },
    },
};


