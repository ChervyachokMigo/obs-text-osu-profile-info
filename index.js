const fs = require('fs');
const getpath = require(`path`);

var { v1, v2, mods, tools, auth } = require ('osu-api-extended');

const mainpath = getpath.dirname(process.argv[1]);

const mode = process.argv[2];

var { get_past_day, get_date_string, get_time_string, escapeString, sleep, log, checkDir } = require(`./tools.js`);

const config = require('./config.js');

var stats = {};
var texts_dir = 'texts'
checkDir(texts_dir);

main();

async function main(){
    log(`log in..`);
    await auth.login_lazer(config.login, config.password);
    await init();
};

async function init(){
    log(`updating details..`);
    var user_details = await v2.user.details(config.login, mode);
    stats.start = user_details.statistics;
    stats.start.follower_count = user_details.follower_count;
    stats.start.pp = Math.floor(stats.start.pp*100)/100;
    stats.now = JSON.parse(JSON.stringify(stats.start));

    var fileDataStart = `${stats.start.pp}\n${stats.start.play_count}\n${stats.start.follower_count}\n`;
    fs.writeFile(`${texts_dir}\\stats_start.txt`,fileDataStart,`utf-8`,()=> {return;});
    var fileDataDiff = `+0 pp\n+0\n+0\n`;
    fs.writeFile(`${texts_dir}\\stats_dif.txt`,fileDataDiff,`utf-8`,()=> {return;});
}

setInterval(async ()=>{
    log(`updating..`);
    await checkdetails();
}, config.updateRateMin*60*1000);

async function checkdetails(){
    var user_details = await v2.user.details(config.login, mode);
    stats.now = user_details.statistics;
    stats.now.follower_count = user_details.follower_count;
    stats.now.pp = Math.floor(stats.now.pp*100)/100

    stats.diff = {};

    stats.diff.pp = Math.floor((stats.now.pp - stats.start.pp)*100)/100;
    stats.diff.play_count = stats.now.play_count - stats.start.play_count;
    stats.diff.follower_count = stats.now.follower_count - stats.start.follower_count;

    ppSign = stats.diff.pp>=0?`+`:'-';
    var pp = `${ppSign}${stats.diff.pp} pp`;

    folowersSign = stats.diff.follower_count>=0?`+`:'-';
    var folowers = `${folowersSign}${stats.diff.follower_count}`;
    var fileDataDifUpdate = `${pp}\n+${stats.diff.play_count}\n${folowers}\n`;
    fs.writeFile(`${texts_dir}\\stats_dif.txt`,fileDataDifUpdate,`utf-8`,()=> {return;});
}

async function repeat(_function, seconds){
    return new Promise((resolve) => {
        setTimeout(async ()=>{
            await _function();
            return resolve;
        }, seconds*1000);
    });
}