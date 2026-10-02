/* 版本:beta_7.29.4 - PC端特有脚本 */
/* 共享功能（开发者模式、暗黑模式等）在 shared/devMode.js 中 */

function ani_page(page,target) {
    if(page !== target){
        if(page !== "none"){
            $("#home,#project,#support,#about,#news,#findour").fadeOut(350);
            setTimeout(function(){$("#findour,#"+target).fadeIn(350);},350);
        }else{
            $("#findour,#"+target).fadeIn(350);
        }
        screen = target;
        localStorage.setItem('currentPage', target);

        document.querySelectorAll('.menu-item').forEach(function(item) {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === target) {
            item.classList.add('active');
        }
    });
    }
}

// 导航栏锁定/解锁功能
const nav = document.getElementById('mainNav');
let timer;
let navLocked = localStorage.getItem('navLocked') === 'true';

// 更新锁按钮状态
function updateLockButton() {
    const lockBtn = document.getElementById('navLockToggle');
    if (lockBtn) {
        if (navLocked) {
            lockBtn.classList.add('locked');
            lockBtn.title = '解锁导航栏';
        } else {
            lockBtn.classList.remove('locked');
            lockBtn.title = '锁定导航栏';
        }
    }
}

// 应用导航栏锁定状态
function applyNavLock() {
    if (navLocked) {
        nav.style.transform = 'translateY(0)';
        nav.style.opacity = '1';
        nav.style.visibility = 'visible';
        clearTimeout(timer);
    }
}

// 切换锁定状态
function toggleNavLock() {
    navLocked = !navLocked;
    localStorage.setItem('navLocked', navLocked);
    updateLockButton();
    applyNavLock();
}

// 导航栏自动收起功能
nav.addEventListener('mouseenter', () => {
    if (navLocked) return;
    clearTimeout(timer);
    nav.style.transform = 'translateY(0)';
    nav.style.opacity = '1';
    nav.style.visibility = 'visible';
});

nav.addEventListener('mouseleave', () => {
    if (navLocked) return;
    timer = setTimeout(() => {
        nav.style.transform = 'translateY(-50px)';
        nav.style.opacity = '0';
    }, 1000);
});

// 页面加载时
window.addEventListener('DOMContentLoaded', () => {
    // 初始化锁按钮
    updateLockButton();
    const lockBtn = document.getElementById('navLockToggle');
    if (lockBtn) {
        lockBtn.addEventListener('click', toggleNavLock);
    }

    // 如果已锁定则保持显示，否则5秒后隐藏
    if (navLocked) {
        nav.style.transform = 'translateY(0)';
        nav.style.opacity = '1';
        nav.style.visibility = 'visible';
    } else {
        nav.style.transform = 'translateY(0)';
        nav.style.opacity = '1';
        nav.style.visibility = 'visible';
        setTimeout(() => {
            nav.style.transform = 'translateY(-50px)';
            nav.style.opacity = '0';
        }, 5000);
    }
});

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

function forceReflow(element) {
    return element.offsetHeight;
}
