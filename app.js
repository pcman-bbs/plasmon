var ipc = require('ipc');
var shell = require('shell');
var iconv = require('iconv-lite');
var PCMan =  require('pcman');
var pcman = null;

class App {
	constructor(url, charset) {
		this.url = url;
		this.container = document.body;
		this.canvas = document.getElementById("canvas");
		this.input_proxy = document.getElementById('input_proxy');
	}
	setup() {
		pcman = new PCMan({
			view: this.canvas,
			input: this.input_proxy,
			opener: shell.openExternal,
			sender: ipc.send.bind(null, 'send'),
			encoder: function(unicode_str) {
				return iconv.encode(unicode_str, 'big5');
			},
			decoder: function(telnet_str) {
				return iconv.decode(telnet_str, 'big5');
			}
		});
		ipc.send('connect', this.url);
		ipc.on('data', pcman.receive.bind(pcman));
		document.title = this.url;
		document.addEventListener('focus', this.set_focus, false);
		this.set_focus();
		this.resize();
	}
	set_focus(e) {
		this.input_proxy.focus();
	}
	resize(){
		pcman.resize();
	}
	finalize() {
		pcman.close();
		pcman = null;
		document.removeEventListener('focus', set_focus, false);
	}
}


function eventHandler(event) {
	switch (event.type) {
		case 'mousedown':
			return pcman.view.onMouseDown(event);
		case 'mousemove':
			return pcman.view.onMouseMove(event);
		case 'mouseup':
			return pcman.view.onMouseUp(event);
		case 'click':
			return pcman.view.onClick(event);
		case 'dblclick':
			return pcman.view.onDblClick(event);
	}
}

document.addEventListener("DOMContentLoaded", function(event) {
	var app = new App('ptt.cc');
	window.onload = app.setup.bind(app);
	window.onunload = app.finalize.bind(app);
	window.onresize = app.resize.bind(app);
	window.onmousedown = app.set_focus.bind(app);
	window.onmouseup = app.set_focus.bind(app);
	document.body.onmousedown = eventHandler;
	document.body.onmousemove = eventHandler;
	document.body.onmouseup = eventHandler;
	document.body.onclick = eventHandler;
	document.body.ondblclick = eventHandler;
});
