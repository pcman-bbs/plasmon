var ipc = require('ipc');
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
			encoder: function(unicode_str) {
				return iconv.encode(unicode_str, 'big5');
			},
			decoder: function(telnet_str) {
				return iconv.decode(telnet_str, 'big5');
			},
			sender: ipc.send.bind(null, 'send')
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

document.addEventListener("DOMContentLoaded", function(event) {
	var app = new App('ptt.cc');
	window.onload = app.setup.bind(app);
	window.onunload = app.finalize.bind(app);
	window.onresize = app.resize.bind(app);
	window.onmousedown = app.set_focus.bind(app);
	window.onmouseup = app.set_focus.bind(app);
});
