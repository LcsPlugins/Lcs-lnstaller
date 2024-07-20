import Vue from 'vue';
import App from './App.vue';
import dotenv from 'dotenv'
require('update-electron-app')()
const { app, autoUpdater, dialog } = require('electron')

Vue.config.productionTip = false;

dotenv.config();

new Vue({
  render: h => h(App),
}).$mount('#app');

const server = 'https://update.electronjs.org'
const feed = `${server}/OWNER/REPO/${process.platform}-${process.arch}/${app.getVersion()}`

autoUpdater.setFeedURL(feed)

setInterval(() => {
  autoUpdater.checkForUpdates()
}, 60000)

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail:
      'A new version has been downloaded. Restart the application to apply the updates.'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('error', (message) => {
  console.error('There was a problem updating the application')
  console.error(message)
})
