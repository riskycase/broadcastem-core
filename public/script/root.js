// 2D array of icons, each element contains icon id and and array of extentions
// that will use the corresponding icon
const icons = [
	['image', ['jpg', 'jpeg', 'png', 'dng', 'bmp', 'tiff']],
	['play', ['mp3', 'ogg', 'avi', 'mp4', 'flac']],
	['file-text', ['txt', 'doc', 'docx', 'md', 'xml', 'html', 'htm', 'log']],
	['database', ['db', 'db3', 'sql', 'sdf']],
	['pdf', ['pdf']],
];

// Sets a global array to support downloading of multiple files
let indices = [];

/*
 * Once page is loaded, queries back the server to check if there are any files
 * available for download, then displays them accordingly
 */
function loadFiles() {
	const xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState === 4 && this.status == 200) {
			displayFiles(JSON.parse(this.responseText));
		}
	};
	xhttp.open('GET', 'download/list', true);
	xhttp.send();
}

/*
 * Takes a number repersenting bytes and convert to human readable format. -1
 * is server response when the size of that file is still being calculated
 */
function humanFileSize(bytes) {
	if (bytes === -1) return 'Calculating size';
	const thresh = 1024;
	if (Math.abs(bytes) < thresh) {
		return bytes + ' B';
	}
	const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	let u = -1;
	do {
		bytes /= thresh;
		++u;
	} while (Math.abs(bytes) >= thresh);
	return bytes.toFixed(2) + ' ' + units[u];
}

/*
 * Gets extention from name, and then try to find the icon for the
 * corresponding file. If not found returns generic icon
 */
function getIcon(name) {
	const extention = name.substring(name.lastIndexOf('.') + 1);
	let icon = icons.find(value => value[1].indexOf(extention) !== -1);
	return icon ? icon[0] : 'file';
}

/*
 * On receiving the response, uses the file object to form a set of elements
 * that show details of the file like name, size and an icon, with the UI
 * to select only certain files for download
 */
function buttonMaker(file) {
	return `<div class="uk-flex-inline uk-flex-middle uk-background-primary uk-light uk-padding-small">
		<span uk-icon="icon: ${
			file.isFolder ? 'folder' : getIcon(file.name)
		}; ratio: 2"></span>
		<div class="uk-width-expand uk-text-truncate" style="padding: 5px">Name: ${
			file.name
		} <br>Size: ${humanFileSize(file.size)}</div>
		<div>
			<a uk-icon="icon: download" onclick="window.open('download/specific?index=${
				file.index
			}', '_self')"></a>
			<br>
			<input type="checkbox" class="uk-checkbox" id="checkbox-${
				file.index
			}" oninput="checkboxHit(${file.index})">
		</div>
	</div>`;
}

/*
 * Uses the server response to display the information back on the webpage
 */
function displayFiles(files) {
	const buttons = files.map(buttonMaker);
	if (files.length)
		document.getElementById(
			'downloadList'
		).innerHTML = `<div class="uk-width-1-1 uk-flex uk-flex-middle uk-flex-right uk-flex-wrap uk-padding-small">
			<div class="uk-padding-small">Download: </div>
			<button class="uk-button uk-button-small uk-button-primary" onclick="downloadSelected()" id="selected" style="display: none">Selected</button>
			<button class="uk-button uk-button-small uk-button-primary" onclick="window.open('download/all', '_self')">All</button>
		</div>
		${buttons.join('<br>')}`;
	else
		document.getElementById(
			'downloadList'
		).innerHTML = `<div class="uk-alert-primary uk-align-center uk-text-center uk-width-1-1" uk-alert>No files selected to share</div>`;
}

const bar = document.getElementById('js-progressbar');
/*
 * Generates an upload object for normal files and zip files
 */
function uploadObject(zip) {
	return {
		url: zip ? '/upload' : '/upload/zip',
		multiple: true,
		type: 'multipart/form-data',
		loadStart: setBarValue,
		progress: setBarValue,
		loadEnd: setBarValue,
		completeAll: function () {
			setTimeout(function () {
				bar.setAttribute('hidden', 'hidden');
			}, 1000);
			alert(
				`${
					zip ? 'Files uploaded' : 'Zips uploaded and extracted'
				}, will be available for sharing now`
			);
			loadFiles();
		},
	};
}

// UIkit js to control file upload
UIkit.upload('#fileUploadArea', uploadObject(false));

// UIkit js to control zip upload
UIkit.upload('#zipUploadArea', uploadObject(true));

/*
 * Sets the value for the progress bar
 */
function setBarValue(e) {
	bar.removeAttribute('hidden');
	bar.max = e.total;
	bar.value = e.loaded;
}

/*
 * Once the button for downloading the selected files is clicked, sends the
 * appropriate request
 */
function downloadSelected() {
	window.open(`download/specific?index=${indices}`, '_self');
}

/*
 * Fires on checkbox value being changed, and updates the array representing
 * files which will be requested for download
 */
function checkboxHit(id) {
	// If checkbox gets selected, adds that id to indices else removes it
	document.getElementById(`checkbox-${id}`).checked
		? indices.push(id)
		: indices.splice(indices.indexOf(id), 1);

	// If indices are empty, hide the 'Selected' download button
	document.getElementById('selected').style.display = indices.length
		? 'inline-block'
		: 'none';
}
