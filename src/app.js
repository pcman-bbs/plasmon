import ipc from 'ipc';
import shell from 'shell';
import iconv from 'iconv-lite';
import PCMan from 'pcman';
import u2b_table from './u2b.json';
import b2u_table from './b2u.json';

let pcman = null;

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
			encoder(str) {
				let data = '';
				for (let i = 0; i < str.length; ++i) {
					if (str.charAt(i) < '\x80') {
						data += str.charAt(i);
						continue;
					}
					let charCodeStr = str.charCodeAt(i).toString(16).toUpperCase();
					charCodeStr = 'x' + ('000' + charCodeStr).substr(-4);
					if (u2b_table[charCodeStr])
						data += u2b_table[charCodeStr];
					else // Not a big5 char
						data += '\xFF\xFD';
				}
				return data;
			},
			decoder(str) {
				let data = '';
				for (let i = 0; i < str.length; ++i) {
					if (str.charAt(i) < '\x80' || i == str.length - 1) {
						data += str.charAt(i);
						continue;
					}
					let b5index = 'x' + str.charCodeAt(i).toString(16).toUpperCase() +
						str.charCodeAt(i + 1).toString(16).toUpperCase();
					if (b2u_table[b5index]) {
						data += b2u_table[b5index];
						++i;
					} else { // Not a big5 char
						data += str.charAt(i);
					}
				}
				return data;
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

document.addEventListener("DOMContentLoaded", (event) => {
	let app = new App('ptt.cc');
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
