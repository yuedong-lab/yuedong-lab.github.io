/* 版本:beta_8.5.1 - 共享开发者模式脚本 */
/* 包含：开发者模式水印、Y+D快捷键、F12禁用、右键禁用、console禁用、暗黑模式切换、新闻自动写入*/

// 开发者模式状态
var devMode = localStorage.getItem('devMode') === 'true';
var pressedKeys = {};

// 注入模态框样式
(function injectModalStyles() {
    var style = document.createElement('style');
    style.textContent = `
        @keyframes devModalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes devModalSlideIn {
            from { opacity: 0; transform: scale(0.9) translateY(-20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
    `;
    document.head.appendChild(style);
})();

// 自定义网页内确认弹窗（替代浏览器confirm弹窗）
function showConfirmModal(message) {
    return new Promise(function(resolve) {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:100000;display:flex;align-items:center;justify-content:center;animation:devModalFadeIn 0.2s ease;';
        
        var modal = document.createElement('div');
        modal.style.cssText = 'background:var(--card-bg,#fff);border-radius:16px;padding:28px 24px;max-width:380px;width:90%;text-align:center;animation:devModalSlideIn 0.3s ease;';
        
        var msg = document.createElement('p');
        msg.style.cssText = 'color:var(--text-color,#333);font-size:16px;line-height:1.6;margin:0 0 24px 0;white-space:pre-line;';
        msg.textContent = message;
        
        var btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display:flex;gap:12px;justify-content:center;';
        
        var cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = 'padding:10px 28px;border:1px solid var(--border-color,#ddd);border-radius:8px;background:transparent;color:var(--text-color,#333);font-size:15px;cursor:pointer;transition:all 0.2s;';
        cancelBtn.onmouseover = function() { this.style.background = 'rgba(0,0,0,0.05)'; };
        cancelBtn.onmouseout = function() { this.style.background = 'transparent'; };
        
        var confirmBtn = document.createElement('button');
        confirmBtn.textContent = '确认';
        confirmBtn.style.cssText = 'padding:10px 28px;border:none;border-radius:8px;background:#4a90d9;color:white;font-size:15px;cursor:pointer;transition:all 0.2s;';
        confirmBtn.onmouseover = function() { this.style.background = '#357abd'; };
        confirmBtn.onmouseout = function() { this.style.background = '#4a90d9'; };
        
        // 焦点索引：0=取消, 1=确认，默认聚焦确认按钮
        var focusedIndex = 1;
        var buttons = [cancelBtn, confirmBtn];
        
        function updateFocus() {
            for (var i = 0; i < buttons.length; i++) {
                if (i === focusedIndex) {
                    buttons[i].style.boxShadow = '0 0 0 3px rgba(74,144,217,0.4)';
                } else {
                    buttons[i].style.boxShadow = 'none';
                }
            }
        }
        
        function closeModal(result) {
            overlay.remove();
            resolve(result);
        }
        
        cancelBtn.onclick = function() { closeModal(false); };
        confirmBtn.onclick = function() { closeModal(true); };
        overlay.onclick = function(e) { if (e.target === overlay) closeModal(false); };
        
        // 键盘导航（仅左右键切换，边界限制：到底不可再继续）
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                if (focusedIndex > 0) {
                    e.preventDefault();
                    focusedIndex--;
                    updateFocus();
                }
            } else if (e.key === 'ArrowRight') {
                if (focusedIndex < buttons.length - 1) {
                    e.preventDefault();
                    focusedIndex++;
                    updateFocus();
                }
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                buttons[focusedIndex].click();
            }
        });
        
        btnContainer.appendChild(cancelBtn);
        btnContainer.appendChild(confirmBtn);
        modal.appendChild(msg);
        modal.appendChild(btnContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // 设置焦点到模态框并更新聚焦样式
        modal.setAttribute('tabindex', '-1');
        modal.focus();
        updateFocus();
    });
}

// 管理开发者模式水印
function toggleWatermark(show) {
    var existing = document.getElementById('devModeWatermark');
    if (show) {
        if (existing) return;
        var watermark = document.createElement('div');
        watermark.id = 'devModeWatermark';
        watermark.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;overflow:hidden;';
        var cols = 6;
        var rows = 8;
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var span = document.createElement('span');
                if(c%2===r%2){
                    span.textContent = 'Dev-mode';
                }else{
                    span.textContent = '开发者模式'
                }
                span.style.cssText = 'position:absolute;color:rgba(128,128,128,0.35);font-size:1.1em;font-weight:bold;white-space:nowrap;transform:rotate(-30deg);user-select:none;';
                span.style.left = ((c * 18 + (r % 2) * 9)) + '%';
                span.style.top = (r * 13 + 3) + '%';
                watermark.appendChild(span);
            }
        }
        document.body.appendChild(watermark);
    } else {
        if (existing) {
            existing.remove();
        }
    }
}

// 检测Y+D组合键切换开发者模式
document.addEventListener('keydown', async function(e) {
    pressedKeys[e.key.toLowerCase()] = true;
    if (pressedKeys['y'] && pressedKeys['d']) {
        if (devMode) {
            var result = await showConfirmModal('是否退出开发者模式？\n\n退出后将恢复以下限制：\n• F12、Ctrl+Shift+I/J/C、Ctrl+U 等快捷键将被阻止\n• 右键菜单将被禁用');
            if (result) {
                devMode = false;
                localStorage.setItem('devMode', devMode);
                toggleWatermark(false);
                $("#devImg").css("display","none");
            }
        } else {
            var result = await showConfirmModal('是否进入开发者模式？\n\n开启后将解除以下限制：\n• F12、Ctrl+Shift+I/J/C、Ctrl+U 等快捷键不再被阻止\n• 右键菜单恢复正常');
            if (result) {
                devMode = true;
                localStorage.setItem('devMode', devMode);
                toggleWatermark(true);
                $("#devImg").css("display","block");
            }
        }
        pressedKeys['y'] = false;
        pressedKeys['d'] = false;
    }
});

document.addEventListener('keyup', function(e) {
    pressedKeys[e.key.toLowerCase()] = false;
});

// 页面加载时检查是否已开启开发者模式
if (devMode) {
    document.addEventListener('DOMContentLoaded', function() {
        toggleWatermark(true);
        $("#devImg").css("display","block");
    });
}

// 禁用右键菜单
document.addEventListener('contextmenu', function(e) {
    if (devMode) return;
    e.preventDefault();
});

// 检测F12和开发者工具快捷键并阻止
document.addEventListener('keydown', function(e) {
    if (devMode) return;
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.shiftKey && e.key === 'S')) {
        e.preventDefault();
        return false;
    }
});

// 暗黑模式切换（通用函数，页面需自行绑定themeToggle点击事件）
function initThemeToggle() {
    var themeToggle = document.getElementById('themeToggle');
    var savedTheme = localStorage.getItem('darkMode') === 'true';
    
    if (savedTheme) {
        document.body.classList.add('dark-mode');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            var isDarkMode = document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
        });
    }
}

// 页面加载时初始化主题切换
document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();
});

//新闻自动写入
function writeNews(){
    for(var i=0;i<newsData.length;i++){
        var title = newsData[i].title;
        var author = newsData[i].author;
        var time = newsData[i].date;
        var contents = newsData[i].content;
        var content = "";

        //新闻详情初始化
        for(var j=0;j<contents.length;j++){
            if(j!=0){
                content += "<br>";
            }
            content += contents[j];
        }
        if(i===0){
            $("#news_box").append("<a href='news_detail.html?id="+(newsData.length-i)+"' class='news_box_link'><div class='news_box'><h1>"+title+"</h1><div><p>"+content+"</p></div><label>"+author+" 编辑于 "+time+"</label></div></a>");
        }else{
            $("#news_box").append("<a href='news_detail.html?id="+(newsData.length-i)+"' class='news_box_link'><div class='news_box'><h2>"+title+"</h2><div><p>"+content+"</p></div><label>"+author+" 编辑于 "+time+"</label></div></a>");
        }
    }
}

//成员自动写入
function writeMember(device){
    for(var i=0;i<members.length;i++){
        var name = members[i].name;
        var job = members[i].job;
        var picture = members[i].picture;
        var id = members[i].id;
        var introduction = members[i].introduction;
        var introStr = "";
        var jobStyle = "";

        //初始化职位标样式
        if(job.includes("室长")){
            jobStyle = "job_master";
        }else{
            if(job.includes("程序")){
                jobStyle = "job_program";
            }
            if(job.includes("美术")){
                jobStyle = "job_art";
            }
            if(job.includes("组长")){
                jobStyle += "_master";
            }
        }

        //人物介绍初始化
        for(var j=0; j<introduction.length; j++){
            if(j != 0){
                introStr += "<br>";
            }
            introStr += introduction[j];
        }

        $("#big_person_box").append("<a href='./member_"+device+".html?id="+id+"' class='person_box'><img class='head_picture' src='"+picture+"' alt='"+name+"' onerror=\"this.alt='加载失败'\"/><div><label class='name'>"+name+"</label><p id='"+jobStyle+"'>"+job+"</p><p class='introduce'>"+introStr+"</p></div></a>");
    }
}

//自动灰度模式
var gray = [
    {
        month:12,
        day:13,
        text:"沉痛悼念所有在南京大屠杀中丧生的同胞"
    },
    {
        month:9,
        day:18,
        text:"勿忘国耻，铭记历史"
    },
    {
        month:5,
        day:12,
        text:"沉痛悼念所有在汶川大地震中丧生的同胞"
    }
];

function timeCheck(date){
    var month = date.getMonth() +1;
    var day = date.getDate();
    var year = date.getFullYear();
    for(var i=0; i<gray.length; i++){
        if(month === gray[i].month && day === gray[i].day){
            $("html").css("filter","grayscale(100%)");
            if(!document.getElementById("specials")){
                $("#findour").append("<p id='specials'>"+gray[i].text+"</p>");
                $("#specials").hide().fadeIn(1000);
            }
            break;
        }else{
            $("html").css("filter","grayscale(0%)");
            if(document.getElementById("specials")){
                $("#specials").fadeOut(1000);
                setTimeout(()=>{
                    $("#specials").remove();
                },1000);
            }
        }
    }
    if(!document.getElementById("copyright")){
        $("#findour").append(`<p id="copyright" style="font-size:13px;color:var(--text-color);margin:15px 0 5px;">版权所有 © 悦动工作室 ${year}</p>`)
    }
}
