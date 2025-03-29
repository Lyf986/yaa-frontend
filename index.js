// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const sidebar = document.getElementById('sidebar');
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const avatarCollapse = document.getElementById('avatarCollapse');
    const mainContent = document.getElementById('main-content');
    const modelSelect = document.getElementById('btn__model-select');
    const selectedModelDisplay = document.querySelector('.selected-model');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settings-panel');
    
    // 初始化选中的模型
    selectedModelDisplay.textContent = modelSelect.options[modelSelect.selectedIndex].text;
    
    // 监听模型选择变化
    modelSelect.addEventListener('change', function() {
        selectedModelDisplay.textContent = this.options[this.selectedIndex].text;
    });
    
    // 侧边栏展开/收缩功能
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        
        // 存储侧边栏状态
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
    
    // 点击切换按钮
    sidebarCollapse.addEventListener('click', function(e) {
        toggleSidebar();
        e.stopPropagation(); // 阻止事件冒泡
    });
    
    // 点击头像折叠/展开
    avatarCollapse.addEventListener('click', function(e) {
        if (sidebar.classList.contains('collapsed')) {
            toggleSidebar();
            e.stopPropagation(); // 阻止事件冒泡
        }
    });
    
    settingsToggle.addEventListener('click', function(e) {
        // 如果侧边栏是展开状态，先折叠
        if (!sidebar.classList.contains('collapsed')) {
            toggleSidebar();
        }
        
        // 切换设置面板显示状态
        settingsPanel.classList.toggle('show');
        e.stopPropagation(); // 阻止事件冒泡
    });
    
    // 点击设置面板外部区域关闭面板
    document.addEventListener('click', function(e) {
        if (!settingsPanel.contains(e.target) ){
            settingsPanel.classList.remove('show');
        }
    });
    
    // 阻止设置面板内部的点击事件冒泡
    settingsPanel.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // 窗口大小改变时检查是否需要折叠侧边栏
    window.addEventListener('resize', checkSidebarState);
    
    // 初始化检查
    checkSidebarState();
    
    // 恢复上次的侧边栏状态
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
    
    /**
     * 检查侧边栏状态并根据窗口大小调整
     */
    function checkSidebarState() {
        const windowWidth = window.innerWidth;
        const breakpoint = 768; // 与CSS中的媒体查询保持一致
        
        if (windowWidth < breakpoint && !sidebar.classList.contains('collapsed')) {
            toggleSidebar();
        }
        
        // 动态调整侧边栏宽度
        if (windowWidth < 480) {
            document.documentElement.style.setProperty('--sidebar-collapsed-width', '50px');
            document.documentElement.style.setProperty('--avatar-size-collapsed', '25px');
            document.documentElement.style.setProperty('--toggle-btn-offset', '8px');
        } else if (windowWidth < 768) {
            document.documentElement.style.setProperty('--sidebar-collapsed-width', '60px');
            document.documentElement.style.setProperty('--avatar-size-collapsed', '30px');
            document.documentElement.style.setProperty('--toggle-btn-offset', '10px');
        }
    }
});