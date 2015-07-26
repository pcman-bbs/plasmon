import ipc from 'ipc';
import net from 'net';

let telnet = new net.Socket();
let telnetConn = false;
let currentData = null;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null;

ipc.on('send', (event, arg) => {
	telnet.write(arg, 'binary');
});

ipc.on('connect', (event, site) => {
	if (!telnetConn) {
		telnet.connect(23, site, () => {
			console.log('TELNET START');
			telnetConn = true;
		});
	} else {
		if (mainWindow && currentData) {
			mainWindow.webContents.send('data', currentData);
		}
	}
});

import app from 'app';  // Module to control application life.
import BrowserWindow from 'browser-window';  // Module to create native browser window.

// Report crashes to our server.
//require('crash-reporter').start();

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	if (process.platform != 'darwin') {
		app.quit();
	}
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		'center': true,
		'dark-theme': true,
		'web-preferences': {
			'web-security': false
		}
	});

	mainWindow.maximize();

	// It is for livereload.
	// If you want to development with livereload,
	// run `npm run server` and then `npm run livereload`.
	if (process.argv.indexOf('--livereload') >= 0) {
		mainWindow.loadUrl('http://localhost:3000/');
	} else {
		// and load the index.html of the app.
		mainWindow.loadUrl('file://' + __dirname + '/index.html');
	}

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});

	telnet.on('data', (data) => {
		currentData = data;
		mainWindow.webContents.send('data', data);
	});
	//mainWindow.toggleDevTools();
});
