// 设置事件监听器
setupEventListeners();
// 获取DOM元素
const sidebar = document.getElementById('sidebar');
const sidebarCollapse = document.getElementById('sidebarCollapse');
const avatarCollapse = document.getElementById('avatarCollapse');
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

// 点击设置图标
settingsToggle.addEventListener('click', function(e) {
    // 如果侧边栏是展开状态，先折叠
    if (!sidebar.classList.contains('collapsed')) {
        sidebar.classList.add('collapsed');
        localStorage.setItem('sidebarCollapsed', 'true');
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
    conversation.classList.add('expanded');
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
// 事件监听器设置
function setupEventListeners(){
    const elements = {
        '#btn__sendMessage': () => sendMsg(),
        '#conversation__input__textarea': e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMsg();
            }
        },
        '#btn_scrollToBottom': () => scrollToBottom(),
         '#sidebarCollapse':e=>{     //侧边栏切换按钮
            toggleSidebar();
            e.stopPropagation();
        },
        '#avatarCollapse':e=>{
            toggleSidebar();   // 点击头像折叠/展开
            e.stopPropagation();            
        },
    };
    Object.entries(elements).forEach(([selector, handler]) => {
        const element = document.querySelector(selector);
        if (element) {
            const eventType = selector === '#conversation__input__textarea' ? 'keypress' : 'click';
            element.addEventListener(eventType, handler);
        }
    });
}
// 发送消息
function sendMsg(){
    // 引入元素：输入框
    const msgInput = document.getElementById('conversation__input__textarea');
    const msg = msgInput.value.trim();
    
    // 输入框为空时，返回
    if(!msg) return

    // 弹出消息
    appendMsg_user(msg)
    appendMsg_ai(msg)
    appendMsg_system(msg)

    // 消息输入框置空
    msgInput.value = '';
    scrollToBottom();
    try{
        const response = await fetch('http://127.0.0.1:12345', {
          method: 'POST',
          headers: { 'Authorzation': 'YAA-API-KEY yaa','Content-Type': 'application/json' },
          body: JSON.stringify({
            id:213124,
            title: '',
            start_time: new Date().toLocaleTimeString(),
            character: "你叫yaa，你是一个智能体",
            status: "进行中",
            messages: [
                {
                    role: "user",
                    content: "你将会回应以下内容"
                }
            ]
         })  // 将对象转为 JSON 字符串
        });
        
        const data = await response.json();
        console.error(data)
        const errorContent = data.messages[0].content;
        appendAiMsg(errorContent)
        
    }

    catch(error){
        console.error(error);
    }
}
// 弹出系统消息
function appendMsg_system(content){
    // const reader=response.bo
    const conversation_content = document.getElementById('conversation__content');
    conversation_content.appendChild(generateMsg_system(content));
}
// 生成系统消息
function generateMsg_system(content){
    const msgDiv = document.createElement('div');
    msgDiv.className = "msg__system";
    msgDiv.innerHTML = content;
    return msgDiv
}

// 弹出用户消息
function appendMsg_user(content){
    const conversation_content = document.getElementById('conversation__content');
    conversation_content.appendChild(generateMsg_user(content));
}
// 生成用户消息
function generateMsg_user(content){
    // 用户名
    const nameDiv = document.createElement('div');
    nameDiv.className = "msg__both__main__name msg__user__main__name";
    nameDiv.innerHTML = "用户名";

    // 内容
    const contentDiv = document.createElement('div');
    contentDiv.className = "msg__both__main__content msg__user__main__content";
    contentDiv.innerHTML = content;

    // 消息主要部分(包含用户名和内容)
    const mainDiv = document.createElement('div');
    mainDiv.className = "msg__both__main msg__user__main";
    mainDiv.appendChild(nameDiv);
    mainDiv.appendChild(contentDiv);

    // 头像
    const avatarImg = document.createElement('img');
    avatarImg.className = "msg__both__avatar msg__user__avatar";
    avatarImg.src = "Byte-Tea-Logo/Byte-Tea.svg";

    // 完整内容消息
    const msgDiv = document.createElement('div');
    msgDiv.className = "msg__both msg__user";
    msgDiv.appendChild(avatarImg);
    msgDiv.appendChild(mainDiv);
    
    return msgDiv
}

// 弹出ai消息
function appendMsg_ai(content){
    const conversation_content = document.getElementById('conversation__content');
    conversation_content.appendChild(generateMsg_ai(content));
}
// 生成ai消息
function generateMsg_ai(content){
    // 用户名
    const nameDiv = document.createElement('div');
    nameDiv.className = "msg__both__main__name msg__ai__main__name";
    nameDiv.innerHTML = "ai模型名称";

    // 内容
    const contentDiv = document.createElement('div');
    contentDiv.className = "msg__both__main__content msg__ai__main__content";
    contentDiv.innerHTML = content;

    // 消息主要部分(包含用户名和内容)
    const mainDiv = document.createElement('div');
    mainDiv.className = "msg__both__main msg__ai__main";
    mainDiv.appendChild(nameDiv);
    mainDiv.appendChild(contentDiv);

    // 头像
    const avatarImg = document.createElement('img');
    avatarImg.className = "msg__both__avatar msg__ai__avatar";
    avatarImg.src = "Byte-Tea-Logo/Byte-Tea.svg";

    // 完整内容消息
    const msgDiv = document.createElement('div');
    msgDiv.className = "msg__both msg__user";
    msgDiv.appendChild(avatarImg);
    msgDiv.appendChild(mainDiv);
    
    return msgDiv
}

// 对话框滚动到最下方
function scrollToBottom(){
    const contentDiv = document.getElementById('conversation__content');
    // conversation__content.scrollTop = conversation__content.scrollHeight;
    contentDiv.scrollTo({
        top: contentDiv.scrollHeight,
        behavior: 'smooth'
    })
}

// 当对话框滚动条不在底部时，显示"回到底部"按钮
document.getElementById('conversation__content').addEventListener('scroll', show_btn_scrollToBottom);

// 显示"回到底部"按钮
function show_btn_scrollToBottom(){
    // 获取对话框元素
    const contentDiv = document.getElementById('conversation__content');
    // 获取回到底部按钮
    const btn_scrollToBottom = document.getElementById('btn_scrollToBottom');

    // 滚动条至顶位置
    const scrollTop = contentDiv.scrollTop;
    // 滚动条长度
    const scrollHeight = contentDiv.scrollHeight;
    // 内容高度
    const clientHeight = contentDiv.clientHeight;
    // 触发显示回底按钮位置
    const show_btn_height = 10;

    // 判断滚动条是否在底部
    const isAtbottom = scrollHeight - scrollTop - clientHeight <= show_btn_height;
    if(!isAtbottom){
        btn_scrollToBottom.classList.add('show');
    }else{
        btn_scrollToBottom.classList.remove('show');
    }
}

// 侧边栏展开/收缩功能
function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    conversation.classList.toggle('expanded');
    
    // 存储侧边栏状态
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
}