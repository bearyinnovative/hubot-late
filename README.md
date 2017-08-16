# hubot-late

record every late in your team

NOTE: this sciprt supprt hubot-bearychat adapter only. universal support and english version coming soon.

See [`src/late.js`](src/late.js) for detail.

## Installation

### Prepare

Please prepare hubot-bearychat according to the doc [hubot-bearychat](https://github.com/bearyinnovative/hubot-bearychat) first.

### Install

In hubot project repo, run:

`npm install hubot-late --save`

Then add **hubot-late** to your `external-scripts.json`:

```json
[
  "hubot-late"
]

```

## Sample Interaction

```
user>> 迟到 help
hubot>> 迟到相关暗语说明：
        1. @xxx 迟到了 => 添加当天迟到，HR 专用
        2. @xxx 没迟到 => 取消当天迟到，HR 专用
        3. @xxx n号迟到了 => 添加当月n号迟到，HR 专用
        4. @xxx n号没迟到 => 取消当月n号迟到，HR 专用
        5. @xxx 迟到几次了 => 查别人迟到
        6. 谁迟到了 => 今天谁迟到了
        7. 我迟到了 => 自己招了
        8. 我迟到几次了 => 查自己迟到
        9. 迟到汇总 => 月底算总帐，HR 专用
        10. 迟到管理员 => 列出所有迟到管理员，第一次使用的时候为初始化自己为迟到管理员
        11. 添加迟到管理员 @xxx => 添加迟到管理员
        12. 删除迟到管理员 @xxx => 删除迟到管理员
user>> 我迟到了
hubot>> 好～已经记下了，你很自觉
user>> 我迟到几次了
hubot>> 截至到目前，@tangxm 迟到了 1 次，分别是 16号
```

## Setup

2. set `HUBOT_LATE_JSON_FILE="a json file path that store all data"` (optional, otherwise hubot will use his brain)

## NPM Module

https://www.npmjs.com/package/hubot-late
