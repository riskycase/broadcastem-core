# ![Logo](./icon-64x64.png) Broadcast 'em Core
A file server based on node.js that allows sharing files over HTTP on the same
 local network, and possibly over the internet if bridging is used

## Badges
[![Test Status](https://gitlab.com/riskycase/broadcastem-core/badges/trunk/pipeline.svg?key_text=Tests&key_width=35)](https://gitlab.com/riskycase/broadcastem-core)
[![Test Coverage](https://gitlab.com/riskycase/broadcastem-core/badges/trunk/coverage.svg?key_text=Code%20coverage&key_width=90)](https://gitlab.com/riskycase/broadcastem-core)
[![Libraries.io dependency status - latest release](https://img.shields.io/librariesio/release/npm/broadcastem-core?label=Dependencies%20%28published%20version%29)](https://libraries.io/npm/broadcastem-core)
[![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/riskycase/broadcastem-core?label=Maintainability)](https://codeclimate.com/github/riskycase/broadcastem-core)
[![npm total downloads](https://img.shields.io/npm/dt/broadcastem-core?label=Total%20Downloads&logo=npm)](https://www.npmjs.com/package/broadcastem-core)
[![NPM](https://img.shields.io/npm/l/broadcastem-core?color=blue)](https://en.wikipedia.org/wiki/MIT_License)
[![npm](https://img.shields.io/npm/v/broadcastem-core?label=Latest%20Version)](https://www.npmjs.com/package/broadcastem-core)
[![Shields.io](https://img.shields.io/badge/Badge%20Provider-Shields.io-brightgreen)](https://shields.io/)

## Setup

Install using 
* npm
```
	npm i broadcastem-core -g
```
* yarn
```
	yarn global add broadcastem-core
```

## Usage

### Options

```
	Usage
	  $ broadcastem-core [options] [files]
	  files is an array of paths to files you want to share

	Options
	  --destination, -d	PATH	Save uploaded files to folder specified in path (defaults to uploads folder in app directory)
	  --list, -l		PATH	Read files to share from the list given in path
	  --port, -p		NUMBER	Start server on specified port (default 3000)
	  --verbose, -v				Log all requests, not just errors
	  --help					Print this message and exit
	  --version					Show version number and exit

	Examples
	  $ broadcastem-core  
```

* Start the server from the usage options given
* Get the IP address of the current device (which is host) on the local network
(let us assume it to be `192.168.1.2`)
* On another device present on the same network, open the following link:
`(IP address):(port)` (here `192.168.1.2:3000`)
* Download the files shared and/or upload any files you want to share to the 
host device
* Retrieve the files sent from the uploads folder
