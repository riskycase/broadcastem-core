const icons = [
	['image','jpg|jpeg|png|dng|bmp|tiff'],
	['play','mp3|ogg|avi|mp4|flac'],
	['file-text','txt|doc|docx'],
	['pdf','pdf'],
	['file','']
];

function loadFiles() {
	const xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState === 4 && this.status == 200) {
			displayFiles(JSON.parse(this.responseText));
		}
	};
	xhttp.open('GET', 'download/list', true);
	xhttp.send();
}

function humanFileSize(bytes) {
	if(bytes === -1) return 'Calculating size';
	const thresh = 1024;
	if(Math.abs(bytes) < thresh) {
		return bytes + ' B';
	}
	const units = ['kB','MB','GB','TB','PB','EB','ZB','YB'];
	let u = -1;
	do {
		bytes /= thresh;
		++u;
	}while(Math.abs(bytes) >= thresh);
	return bytes.toFixed(2)+' '+units[u];
}

function getIcon(name) {
	const extention = name.substring(name.lastIndexOf('.') + 1);
	return icons.find((value) => extention.match(value[1]))[0];
}

function buttonMaker(file) {
	return `<div class="uk-flex-inline uk-flex-middle uk-background-primary uk-light uk-padding-small">
		<span uk-icon="icon: ${file.isFolder ? 'folder' : getIcon(file.name)}; ratio: 2"></span>
		<div class="uk-width-expand" style="padding: 5px">Name: ${file.name} <br>Size: ${humanFileSize(file.size)}</div>
		<a uk-icon="icon: download" onclick="window.open('download/specific?index=${file.index}', '_self')"></a>
	</div>`
}

function displayFiles(files) {
	const buttons = files.map(buttonMaker)
	if(files.length) 
		document.getElementById('downloadList').innerHTML = `<div class="uk-width-1-1 uk-flex uk-flex-middle uk-flex-right uk-flex-wrap uk-padding-small">
			<button class="uk-button uk-button-primary" onclick="window.open('download/all', '_self')">Download All</button>
		</div>
		${buttons.join('<br>')}`;
	else
		document.getElementById('downloadList').innerHTML = `<div class="uk-alert-primary uk-align-center uk-text-center uk-width-1-1" uk-alert>No files selected to share</div>`
}

const bar = document.getElementById('js-progressbar');
UIkit.upload('.js-upload', {
	url: '/upload',
	multiple: true,
	type: 'multipart/form-data',
	beforeSend: function() {
		console.log('beforeSend', arguments);
	},
	beforeAll: function() {
		console.log('beforeAll', arguments);
	},
	load: function() {
		console.log('load', arguments);
	},
	error: function() {
		console.log('error', arguments);
	},
	complete: function() {
		console.log('complete', arguments);
	},
	loadStart: function(e) {
		console.log('loadStart', arguments);
		bar.removeAttribute('hidden');
		bar.max = e.total;
		bar.value = e.loaded;
	},
	progress: function(e) {
		console.log('progress', arguments);
		bar.max = e.total;
		bar.value = e.loaded;
	},
	loadEnd: function(e) {
		console.log('loadEnd', arguments);
		bar.max = e.total;
		bar.value = e.loaded;
	},
	completeAll: function() {
		console.log('completeAll', arguments);
		setTimeout(function() {
			bar.setAttribute('hidden', 'hidden');
		}, 1000);
		alert('Files uploaded, will be available for sharing now');
		loadFiles();
	}
});