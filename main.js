var ipc = require('ipc');
var net = require('net');

var telnet;
var telnetConn = false;
var currentData = null;
var currentSite = null;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

function telnetConnect(site) {
	currentSite = site;
	telnetConn = true;
	telnet = new net.Socket();
	telnet.connect(23, site, function() {
		console.log('TELNET START');
	});

	telnet.on('data', function(data) {
		currentData = data;
		mainWindow.webContents.send('data', data);
	});

	telnet.on('end', function() {
		console.log('TELNET END');
		telnetConn = false;
	});
}

ipc.on('send', function(event, arg) {
	if (telnetConn) telnet.write(arg, 'binary');
	else telnetConnect(currentSite);
});

ipc.on('connect', function(event, site){
	if (!telnetConn) {
		telnetConnect(site);
	} else {
		if (mainWindow && currentData) {
			mainWindow.webContents.send('data', currentData);
		}
	}
});

var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

// Report crashes to our server.
//require('crash-reporter').start();

// Quit when all windows are closed.
app.on('window-all-closed', function() {
	if (process.platform != 'darwin')
		app.quit();
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
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
	mainWindow.on('closed', function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});

	//mainWindow.toggleDevTools();
});
