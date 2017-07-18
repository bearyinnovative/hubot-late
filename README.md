# hubot-late

record every late in your team

NOTE: this sciprt supprt hubot-bearychat adapter only. universal support and english version coming soon.

See [`src/late.js`](src/late.js) for detail.

## Installation

In hubot project repo, run:

`npm install hubot-late --save`

Then add **hubot-late** to your `external-scripts.json`:

```json
[
  "hubot-late"
]

```

## Setup

1. set `HUBOT_LATE_ADMIN="your admin user id"`
2. set `HUBOT_LATE_JSON_FILE="a json file path that store all data"` (optional, otherwise hubot will use his brain)

## NPM Module

https://www.npmjs.com/package/hubot-late
