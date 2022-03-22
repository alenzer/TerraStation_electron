const path = require('path')
const { app, shell, BrowserWindow, ipcMain, session, BrowserView } = require('electron')
const debug = require('electron-debug')

/* enable devtools hotkeys in Windows production builds */
process.platform === 'win32' && debug({ isEnabled: true, showDevTools: false })

/* version */
const version = '1.2.0'
const isLocal = true

/* window */
let win
const createWindow = () => {
  const config = {
    width: isLocal ? 1600 : 1440,
    height: 960,
    minWidth: 320,
    minHeight: 480,
    maxWidth: isLocal ? 3840 : 1440,
    // titleBarStyle: 'hidden',
    webPreferences: {
      webviewTag : true,
      nodeIntegration: true, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, 'preload.js'),
    },
  }

  const url = isLocal
    ? `https://localhost:${process.env.PORT || 3000}`
    : 'https://station.terra.money'

  win = new BrowserWindow(config)
  win.webContents.setUserAgent("5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36");
                                    //  5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) station-electron/1.2.0 Chrome/96.0.4664.174 Electron/16.1.0 Safari/537.36
  win.removeMenu()
  win.loadURL(url)
  win.on('closed', () => (win = null))

  win.webContents.setZoomFactor(1.0)
  win.webContents
    .setVisualZoomLevelLimits(1, 10)
    .catch((err) => console.log(err))
  win.webContents.openDevTools()

  const zoomFunction = (win, event, zoomDirection) => {
    const currentZoom = win.webContents.getZoomFactor()
    if (zoomDirection === 'in') {
      win.webContents.setZoomFactor(currentZoom + 0.1)
    }
    if (zoomDirection === 'out' && currentZoom > 0.2) {
      win.webContents.setZoomFactor(currentZoom - 0.1)
    }
  }

  win.webContents.on('zoom-changed', (event, zoomDirection) => {
    zoomFunction(win, event, zoomDirection)
  })

  win.webContents.on('new-window', (e, url) => {
    e.preventDefault()
    shell.openExternal(url)
  })

  // const reactDevToolsPath ="C:\\Users\\Webdeveloper\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 18\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\4.23.0_0"

  // const walletPath = "C:\\Users\\Webdeveloper\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 7\\Extensions\\aiifbnbfobpmeekipheeijimdpnlpgpp\\2.6.1_0"

  const walletPath = "terra_wallet"

  // const createPopup = (file) => {
  //   return new BrowserWindow({
  //     title: 'MetaMask',
  //     width: isLocal ? 800 : 600,
  //     height: 600,
  //     titleBarStyle: 'hidden',
  //     // type: 'popup',
  //     // resizable: false
  //   });
  // };

  app.whenReady().then(async () => {
    // await session.defaultSession.loadExtension(reactDevToolsPath)

    await session.defaultSession.loadExtension(path.join(__dirname, walletPath));
  })

  win.webContents.session.webRequest.onHeadersReceived(
    { urls: ['*://*/*'] },
    (details, callback) => {
      Object.keys(details.responseHeaders).filter(x => x.toLowerCase() === 'x-frame-options')
        .map(x => delete details.responseHeaders[x])

      callback({
        cancel: false,
        responseHeaders: details.responseHeaders,
      })
    },
  )
}

const onCertError = (event, webContents, url, error, certificate, callback) => {
  event.preventDefault()
  callback(true)
}

/* app */
app.on('ready', createWindow)
app.on('window-all-closed', () => app.quit())
app.on('activate', () => win === null && createWindow())
isLocal && app.on('certificate-error', onCertError)

/* ipc */
const { signTx, generateAddresses } = require('./station')
const { generateSeed, generateWalletFromSeed } = require('./wallet')
const { encrypt, decrypt } = require('./keystore')

ipcMain.on('version', (event, arg) => {
  event.returnValue = version
})

ipcMain.on('signTx', (event, arg) => {
  event.returnValue = signTx(arg)
})

ipcMain.on('generateAddresses', async (event, seed) => {
  event.returnValue = await generateAddresses(seed)
})

ipcMain.on('generateSeed', (event) => {
  event.returnValue = generateSeed()
})

ipcMain.on('generateWalletFromSeed', async (event, [seed, bip]) => {
  event.returnValue = await generateWalletFromSeed(seed, bip)
})

ipcMain.on('encrypt', (event, [msg, pass]) => {
  event.returnValue = encrypt(msg, pass)
})

ipcMain.on('decrypt', (event, [msg, pass]) => {
  event.returnValue = decrypt(msg, pass)
})

let metamaskPopup;

ipcMain.on('connectWallet', (event, arg) => {
  if(metamaskPopup && !metamaskPopup.isDestroyed()) metamaskPopup.close();
  
  metamaskPopup = new BrowserWindow({
    title: 'MetaMask',
    width: isLocal ? 800 : 600,
    height: 600,
    // type: 'popup',
    // resizable: false
  });
  metamaskPopup.loadURL(`chrome-extension://aiifbnbfobpmeekipheeijimdpnlpgpp/index.html`);
  metamaskPopup.webContents.openDevTools()

  metamaskPopup.on('close', function() { //   <---- Catch close event
console.log("close button");
    if(metamaskPopup && !metamaskPopup.isDestroyed()){
      metamaskPopup.hide();
    }
  });

  event.returnValue = "return";
  console.log("return");
  return "EIOWE";
})