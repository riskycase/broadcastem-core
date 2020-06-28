# ![Logo](./icon-64x64.png) Broadcast 'em Core
A file server based on node.js that allows sharing files over HTTP on the same
 local network, and possibly over the internet if bridging is used

## Badges
[![Build Status](https://travis-ci.com/riskycase/broadcastem-core.svg?branch=trunk)](https://travis-ci.com/riskycase/broadcastem-core)
[![Test Coverage](https://api.codeclimate.com/v1/badges/39ae668e4b548ac882d5/test_coverage)](https://codeclimate.com/github/riskycase/broadcastem-core/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/39ae668e4b548ac882d5/maintainability)](https://codeclimate.com/github/riskycase/broadcastem-core/maintainability)

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
	  $ npm start [options] [files]
	  files is an array of paths to files you want to share

	Options
	  --destination, -d	PATH	Save uploaded files to folder specified in path (defaults to uploads folder in app directory)
	  --list, -l		PATH	Read files to share from the list given in path
	  --port, -p		NUMBER	Start server on specified port (default 3000)
	  --verbose, -v				Log all requests, not just errors
	  --help					Print this message and exit
	  --version					Show version number and exit

	Examples
	  $ npm start  
```

* Start the server from the usage options given
* Get the IP address of the current device (which is host) on the local network
(let us assume it to be `192.168.1.2`)
* On another device present on the same network, open the following link:
`(IP address):(port)` (here `192.168.1.2:3000`)
* Download the files shared and/or upload any files you want to share to the 
host device
* Retrieve the files sent from the uploads folder
