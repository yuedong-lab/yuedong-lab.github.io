/* 版本:beta_7.29.4 - 移动端特有脚本 */
/* 共享功能（开发者模式、暗黑模式等）在 shared/devMode.js 中 */

// 页面切换
function switchPage(pageName) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(function(page) {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    var targetPage = document.getElementById(pageName);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新菜单项状态
    document.querySelectorAll('.menu-item').forEach(function(item) {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active');
        }
    });
    
    // 保存当前页面到localStorage
    localStorage.setItem('mobileCurrentPage', pageName);
    
    // 关闭侧滑菜单
    closeMenu();
}

// 侧滑菜单控制
function openMenu() {
    document.getElementById('sideMenu').classList.add('open');
    document.getElementById('menuOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    document.getElementById('sideMenu').classList.remove('open');
    document.getElementById('menuOverlay').classList.remove('show');
    document.body.style.overflow = '';
}

// 菜单事件绑定
document.addEventListener('DOMContentLoaded', function() {
    var menuToggle = document.getElementById('menuToggle');
    var closeMenuBtn = document.getElementById('closeMenu');
    var menuOverlay = document.getElementById('menuOverlay');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', openMenu);
    }
    
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeMenu);
    }
    
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }
    
    // 恢复上次浏览的页面
    var savedPage = localStorage.getItem('mobileCurrentPage');
    if (savedPage && savedPage !== 'home') {
        switchPage(savedPage);
    }
    
    // 菜单项点击切换页面
    document.querySelectorAll('.menu-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var page = this.getAttribute('data-page');
            switchPage(page);
        });
    });
});
