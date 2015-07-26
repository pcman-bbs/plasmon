var ipc = require('ipc');
var net = require('net');

var telnet = new net.Socket();

ipc.on('send', function(event, arg) {
	telnet.write(arg, 'binary');
});

ipc.on('connect', function(event, site){
	telnet.connect(23, site, function() {
		console.log('TELNET START');
	});
});

var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

// Report crashes to our server.
//require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

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

	if (process.env.DEBUG) {
		mainWindow.openDevTools({ detach: true });
	}

  // and load the index.html of the app.
  	mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

	telnet.on('data', function(data) {
		mainWindow.webContents.send('data', data);
	});
	//mainWindow.toggleDevTools();
});
