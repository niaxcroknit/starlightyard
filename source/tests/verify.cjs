const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),js=fs.readFileSync(path.join(root,'app.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');new vm.Script(js);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets-manifest.json'),'utf8'));for(const asset of manifest)assert(fs.existsSync(path.join(root,asset.file)),asset.file);
const names=['calendarDay','petDates','dayWidgetModel','isPetDay'],parts=[js.match(/const DAY_KINDS=.*?;\r?\n/)[0],...names.map(name=>{const match=js.match(new RegExp('function '+name+'\\([\\s\\S]*?\\n}'));assert(match,name);return match[0];})];
const scope={};vm.createContext(scope);vm.runInContext(parts.join('\n')+'\nglobalThis.api={calendarDay,dayWidgetModel,isPetDay}',scope);const {calendarDay,dayWidgetModel}=scope.api;
assert.equal(calendarDay('2025-02-29'),null);assert.equal(calendarDay('2024-03-01')-calendarDay('2024-02-28'),2);
const p={name:'Test',dates:{met:'2024-01-01'}};assert.equal(dayWidgetModel(p,'2024-04-10').elapsed,100);assert.equal(dayWidgetModel(p,'2024-04-10').milestone,true);assert.equal(dayWidgetModel(p,'2023-12-31').prefix,'D−');assert.equal(dayWidgetModel({name:'Old',day:'2020-01-01'},'2026-01-01').kind,'day');
assert(html.indexOf('id="settingsVeil"')<html.indexOf('id="dayWidget"'));console.log('PASS: JS syntax, '+manifest.length+' assets, dates, milestones and settings-only date card.');
