# ![Logo](https://i.imgur.com/JAukmcD.png) Broadcast 'em Core

A file server based on node.js that allows sharing files over HTTP on the same
local network, and possibly over the internet if bridging is used

## Badges

[![Test Status](https://img.shields.io/gitlab/pipeline/riskycase/broadcastem-core/trunk?label=Tests&logo=Gitlab)](https://gitlab.com/riskycase/broadcastem-core)
[![LTS code coverage](https://img.shields.io/gitlab/coverage/riskycase/broadcastem-core/trunk?job_name=Coverage%20LTS&label=LTS%20Coverage&logo=Node.js)](https://gitlab.com/riskycase/broadcastem-core/-/pipelines/)
[![Latest code coverage](https://img.shields.io/gitlab/coverage/riskycase/broadcastem-core/trunk?job_name=Coverage%20Latest&label=Latest%20Version%20Coverage&logo=Node.js)](https://gitlab.com/riskycase/broadcastem-core/-/pipelines/)
[![Libraries.io dependency status - latest release](https://img.shields.io/librariesio/release/npm/broadcastem-core?label=Dependencies%20%28published%20version%29)](https://libraries.io/npm/broadcastem-core)
[![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/riskycase/broadcastem-core?label=Code%20Quality&logo=Code%20Climate)](https://codeclimate.com/github/riskycase/broadcastem-core)
[![npm total downloads](https://img.shields.io/npm/dt/broadcastem-core?label=Total%20Downloads&logo=npm)](https://www.npmjs.com/package/broadcastem-core)
[![NPM](https://img.shields.io/npm/l/broadcastem-core?color=blue&label=License)](https://en.wikipedia.org/wiki/MIT_License)
[![npm](https://img.shields.io/npm/v/broadcastem-core?label=Latest%20Version)](https://www.npmjs.com/package/broadcastem-core)
[![Shields.io](https://img.shields.io/badge/Badge%20Provider-Shields.io-brightgreen)](https://shields.io/)

## Setup

Install using

-   npm

```
	npm i broadcastem-core
```

-   yarn

```
	yarn add broadcastem-core
```

## Usage

```js
const core = require('broadcastem-core');

core(options).then(app => {
	//Use app
});
```

## Documentation

[Wiki](https://gitlab.com/riskycase/broadcastem-core/-/wikis/Home)

## License

Copyright 2020 Hrishikesh Patil

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
