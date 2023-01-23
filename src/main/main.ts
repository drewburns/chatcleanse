/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';

import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
var Filter = require('bad-words');
const fse = require('fs-extra');

let fs = require('fs');

const Store = require('electron-store');

const store = new Store();

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('getProblemMessages', async (event, arg) => {
  const resolved = store.get('resolved');
  // console.log('resolved', resolved);
  const desktopPath = app.getPath('desktop');
  const allMessages = store.get('problemMessages');
  if (!resolved) {
    return event.reply('problemMessages', {
      messages: allMessages,
      desktopPath,
    });
  }
  const filteredResolve = allMessages.filter(
    (m) => !resolved.includes(m.timestamp_ms)
  );
  return event.reply('problemMessages', {
    messages: filteredResolve,
    desktopPath,
  });
});

ipcMain.on('resolveMessage', async (event, timestamp) => {
  const resolved = store.get('resolved');
  if (resolved) {
    store.set('resolved', [...resolved, timestamp]);
  } else {
    store.set('resolved', [timestamp]);
  }
});

ipcMain.on('reset', async (event, arg) => {
  store.delete('problemMessages');
  store.delete('resolved');
  // ipcMain.sendMe.reply('go-to-page', '');
  mainWindow?.webContents.send('go-to-page', '');
});

const getContext = (messages: any[], problemMessageIndex: number) => {
  if (messages.length === 1) {
    return [];
  }
  if (messages.length <= 4) {
    return messages.splice(problemMessageIndex, 1);
  }
  if (problemMessageIndex <= 1) {
    return messages.slice(0, 4);
  }

  if (problemMessageIndex === messages.length - 1) {
    return messages.slice(-4);
  }
  return messages.slice(problemMessageIndex - 2, problemMessageIndex + 2);
};

var walk = function (dir) {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = dir + '/' + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(walk(file));
    } else {
      /* Is a file */
      results.push(file);
    }
  });
  return results;
};

const mode = (a: string[]) => {
  a = a.slice().sort((x, y) => x - y);

  var bestStreak = 1;
  var bestElem = a[0];
  var currentStreak = 1;
  var currentElem = a[0];

  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] !== a[i]) {
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
        bestElem = currentElem;
      }

      currentStreak = 0;
      currentElem = a[i];
    }

    currentStreak++;
  }

  return currentStreak > bestStreak ? currentElem : bestElem;
};
const getUserName = (files: string[]) => {
  const usernameCounterArr: string[] = [];
  files.forEach((f) => {
    const data = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const x in data.messages) {
      const m = data.messages[x];
      usernameCounterArr.push(m.sender_name);
    }
  });
  return mode(usernameCounterArr);
};

const searchAllTextsForKeyWord = (keyword: string) => {
  const desktopPath = app.getPath('desktop') + '/chatcleanse_data';
  const allFiles = walk(desktopPath);
  const files = allFiles.filter(
    (x) =>
      x.includes('/messages/inbox/') &&
      x.includes('.json') &&
      !x.includes('secret_conversations')
  );
  const foundMessages = [];
  const username = getUserName(files);
  files.forEach((f) => {
    const data = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const x in data.messages) {
      const m = data.messages[x];
      if (
        m.content &&
        m.content.toLowerCase().indexOf(keyword.toLowerCase()) > -1
      ) {
        foundMessages.push({
          ...m,
          username,
          participants: data.participants,
          title: data.title,
          context: getContext(data.messages, parseInt(x)),
          thread_path: data.thread_path,
        });
      }
    }
  });
  return foundMessages;
};

ipcMain.on('add-word', async (event, arg) => {
  const addWords = store.get('addWords');
  if (!addWords) {
    store.set('addWords', addWords.concat(arg));
  } else {
    store.set('addWords', [arg]);
  }
});

ipcMain.on('omit-word', async (event, arg) => {
  const omitWords = store.get('omitWords');
  if (!omitWords) {
    store.set('omitWords', omitWords.concat(arg));
  } else {
    store.set('omitWords', [arg]);
  }
});

ipcMain.on('search-texts', async (event, arg) => {
  const found = searchAllTextsForKeyWord(arg);
  event.reply('search-results', found);
});

ipcMain.on('file-drop', async (event, arg) => {
  const desktopPath = app.getPath('desktop') + '/chatcleanse_data';
  if (!fs.existsSync(desktopPath)) {
    fs.mkdirSync(desktopPath, { recursive: true });
  }

  arg.forEach((file) => {
    const newPath = desktopPath + '/' + file.split('/').slice(5).join('/');
    fse.copy(file, newPath);
    // fs.createReadStream(file).pipe(fs.createWriteStream(newPath));
  });

  const files = arg.filter(
    (x) =>
      x.includes('/messages/inbox/') &&
      x.includes('.json') &&
      !x.includes('secret_conversations')
  );
  // const data = fs.readFileSync(arg[0], 'utf8');
  let problemMessages = [];
  const filter = new Filter(); // bad words filter
  const newBadWords = ['me hard', 'so hard'];
  let removeWords = ['god', 'damn', 'shit', 'hell', 'pissed'];
  filter.removeWords(...removeWords);
  filter.addWords(...newBadWords);

  const username = getUserName(files);
  files.forEach((f) => {
    const data = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const x in data.messages) {
      const m = data.messages[x];
      if (m.content && filter.isProfane(m.content)) {
        problemMessages.push({
          ...m,
          username,
          participants: data.participants,
          title: data.title,
          context: getContext(data.messages, parseInt(x)),
          thread_path: data.thread_path,
        });
      }
    }
  });
  problemMessages = problemMessages.sort(
    (a, b) => a.timestamp_ms - b.timestamp_ms
  );

  if (arg.length > 0) {
    store.set('hasUploaded', true);
    store.set('problemMessages', problemMessages);
  }
  // console.log(problemMessages);
  event.reply('problem-messages', problemMessages);
  if (problemMessages.length !== 0) {
    mainWindow.webContents.send('go-to-page', 'results');
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webSecurity: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
    // store.delete('problemMessages');
    const problemMessages = store.get('problemMessages');
    if (problemMessages) {
      mainWindow.webContents.send('go-to-page', 'results');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
