//Description:
//  Record every late in your team
//
//Configuration:
//
// HUBOT_LATE_JSON_FILE
//
//Commands:
// hubot 迟到 help - 获取迟到相关使用帮助
// hubot @xxx 迟到了 - 添加当天迟到，迟到管理员专用
// hubot @xxx 没迟到 - 取消当天迟到，迟到管理员专用
// hubot @xxx n号迟到了 - 添加当月n号迟到，迟到管理员专用
// hubot @xxx n号没迟到 - 取消当月n号迟到，迟到管理员专用
// hubot @xxx 迟到几次了 - 查别人迟到
// hubot 谁迟到了 - 今天谁迟到了
// hubot 我迟到了 - 自己招了
// hubot 我迟到几次了 - 查自己迟到
// hubot 迟到汇总 - 月底算总帐，迟到管理员专用
// hubot 迟到管理员 - 列出所有迟到管理员，第一次使用的时候为初始化自己为迟到管理员
// hubot 添加迟到管理员 @xxx - 添加迟到管理员
// hubot 删除迟到管理员 @xxx - 删除迟到管理员
//
//Author:
//  loddit

"use strict";

const fs = require("fs");
const moment = require("moment");
const remove = require("lodash.remove");
const includes = require("lodash.includes");
const dataFilePath = process.env.HUBOT_LATE_JSON_FILE;

function renderMembers(members) {
  return members.map((id) => `@<=${id}=>`).join(' ');
}

function getDayString (res) {
  if (res.match[2]) {
    const date = parseInt(res.match[2].replace("号"));
    const today = new Date();
    return moment(today.setDate(date)).format('YYYY-MM-DD');
  } else {
    return moment().format('YYYY-MM-DD');
  }
}

module.exports = (robot) => {

  function checkAdmin (res) {
    const lataData = loadData();
    const admins = lataData.admins || [];
    if (admins.length) {
      return includes(admins, res.message.user.id);
    } else {
      robot.logger.info("还没有迟到管理员，先对 Hubot 说 `迟到管理员` 来初始化");
      return false;
    }
  }

  function loadLateData () {
    if (dataFilePath) {
      return JSON.parse(fs.readFileSync(dataFilePath)) || {};
    } else {
      return JSON.parse(robot.brain.get("hubot-late")) || {};
    }
  }

  function saveLateData (data) {
    if (dataFilePath) {
      fs.writeFileSync(dataFilePath, JSON.stringify(data));
    } else {
      robot.brain.set("hubot-late", JSON.stringify(data));
    }
  }

  (function ensureJsonFile() {
    try {
      loadLateData();
    } catch (err) {
      saveLateData({});
    }
  })();


  robot.respond(/迟到(帮助| help)/i, (res) => {
    res.send(`迟到相关暗语说明：
1. @xxx 迟到了 => 添加当天迟到，迟到管理员专用
2. @xxx 没迟到 => 取消当天迟到，迟到管理员专用
3. @xxx n号迟到了 => 添加当月n号迟到，迟到管理员专用
4. @xxx n号没迟到 => 取消当月n号迟到，迟到管理员专用
5. @xxx 迟到几次了 => 查别人迟到
6. 谁迟到了 => 今天谁迟到了
7. 我迟到了 => 自己招了
8. 我迟到几次了 => 查自己迟到
9. 迟到汇总 => 月底算总帐，迟到管理员专用
10. 迟到管理员 => 列出所有迟到管理员，第一次使用的时候为初始化自己为迟到管理员
11. 添加迟到管理员 @xxx => 添加迟到管理员
12. 删除迟到管理员 @xxx => 删除迟到管理员
    `);
  });

  robot.respond(/(.+) (\d+号|)迟到了/i, (res) => {
    if (!checkAdmin(res)) {
      res.send(`你没有权限哦~`);
      return;
    }
    const lateData = loadLateData();
    const newLateGuys = res.match[1].replace(/@<=/g, '').replace(/=>/g, '').split(' ').filter(Boolean);
    const dayString = getDayString(res);
    let lateGuys = lateData[dayString] || [];
    lateGuys = Array.from(new Set(lateGuys.concat(newLateGuys)));
    lateData[dayString] = lateGuys;
    saveLateData(lateData);
    res.send(`好～已经记下了，${dayString} 迟到的人有 ${renderMembers(lateGuys)}`);
  });

  robot.respond(/我迟到了/i, (res) => {
    const lateData = loadLateData();
    const todayString = moment().format('YYYY-MM-DD');
    let lateGuys = lateData[todayString] || [];
    lateGuys = Array.from(new Set(lateGuys.concat(res.message.user.id)));
    lateData[todayString] = lateGuys;
    saveLateData(lateData);
    res.send(`好～已经记下了，你很自觉`);
  });


  robot.respond(/迟到管理员/i, (res) => {
    const lateData = loadData();
    const admins = lateData.admins || [];
    if (admins.length) {
      res.send(`当前的迟到管理员是 ${renderMembers(admins)}`);
    } else {
      const uid = res.message.user.id;
      admins.push(uid);
      lateData.admins = admins;
      saveData(lateData);
      res.send(`初始化迟到管理员成功，当前管理员是 ${renderMembers(admins)}`);
    }
  });


  robot.respond(/添加迟到管理员 (.+)/i, (res) => {
    if (!checkadmin(res)) {
      res.send(`你没有权限哦~`);
      return;
    }
    const lateData = loadData();
    const admins = lateData.admins || [];
    const newAdminId = res.match[1].replace(/@<=/g, '').replace(/=>/g, '').trim();
    if (includes(admins, newAdminId)) {
      res.send(`${renderMembers([newAdminId])} 已经是迟到管理员`);
    } else {
      admins.push(newAdminId);
      lateData.admins = admins;
      saveData(lateData);
      res.send(`添加 ${renderMembers([newAdminId])} 为迟到管理员`);
    }
  });

  robot.respond(/删除迟到管理员 (.+)/i, (res) => {
    if (!checkAdmin(res)) {
      res.send(`你没有权限哦~`);
      return;
    }
    const lateData = loadData();
    const admins = lataData.admins || [];
    const delAdminId = res.match[1].replace(/@<=/g, '').replace(/=>/g, '').trim();
    if (includes(admins, delAdminId)) {
      remove(admins, delAdminId);
      lataData.admins = admins;
      saveData(lataData);
      res.send(`把 ${renderMembers([delAdminId])} 从迟到管理员里移除`);
    } else {
      res.send(`${renderMembers([delAdminId])} 不是迟到管理员`);
    }
  });

  robot.respond(/(.+) (\d+号|)没迟到/i, (res) => {
    if (!checkAdmin(res)) {
      res.send(`你没有权限哦~`);
      return;
    }
    const lateData = loadLateData();
    const luckyGuys = res.match[1].replace(/@<=/g, '').replace(/=>/g, '').split(' ').filter(Boolean);
    const dayString = getDayString(res);
    let lateGuys = lateData[dayString] || [];
    remove(lateGuys, (id) => includes(luckyGuys, id));
    lateData[dayString] = lateGuys;
    saveLateData(lateData);
    if (lateGuys.length === 0) {
      res.send(`好吧 ${dayString} 还没人迟到呢`);
    } else {
      res.send(`好～以后注意点啊，${dayString} 迟到的人有 ${renderMembers(lateGuys)}`);
    }
  });

  robot.respond(/谁迟到了/i, (res) => {
    const lateData = loadLateData();
    const todayString = moment().format('YYYY-MM-DD');
    let lateGuys = lateData[todayString] || [];
    if (lateGuys.length === 0) {
      res.send(`截至到目前，今天还没人迟到`);
    } else {
      res.send(`截至到目前，今天迟到的人有 ${renderMembers(lateGuys)}`);
    }
  });

  robot.respond(/(.*\s|我)迟到几次/i, (res) => {
    let days = [];
    const member = res.match[1] === '我' ?  res.message.user.id : res.match[1].replace(/@<=/g, '').replace(/=>/g, '').replace(/ /g, '');
    const lateData = loadLateData();
    const monthString = moment().format('YYYY-MM');
    Array(31).fill().forEach((_, index) => {
      const dayString = `0${index + 1}`.slice(-2);
      const lateGuys = lateData[`${monthString}-${dayString}`] || [];
      if (includes(lateGuys, member)) {
        days.push(`${dayString}号`);
      }
    });
    const length = days.length
    if (length === 0) {
      res.send(`截至到目前，${renderMembers([member])} 还没有迟到～`);
    } else {
      res.send(`截至到目前，${renderMembers([member])} 迟到了 ${length} 次，分别是 ${days.join(",")}`);
    }
  });

  robot.respond(/迟到汇总/i, (res) => {
    if (!checkAdmin(res)) {
      res.send(`你没有权限哦~`);
      return;
    }
    let daysMap = {};
    const lateData = loadLateData();
    const monthString = moment().format('YYYY-MM');
    Array(31).fill().forEach((_, index) => {
      const dayString = `0${index + 1}`.slice(-2);
      const lateGuys = lateData[`${monthString}-${dayString}`] || [];
      lateGuys.forEach((member) => {
        daysMap[member] = (daysMap[member] || 0) + 1;
      })
    });
    let text = `这个月的迟到情况是：\n`
    Object.keys(daysMap).sort((a,b) => {
      if (daysMap[a] < daysMap[b]) {
        return 1;
      } else {
        return daysMap[a] === daysMap[b] ? 0 : -1;
      };
    }).forEach((member) => {
      const days = daysMap[member];
      text += `${renderMembers([member])} 迟到了 ${days} 次`;
    });
    res.send(text);
  });
}

