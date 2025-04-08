// 对话历史
let conversationHistory = [{ role: 'system', content: '你叫“yaa”，接下来请你根据用户的指示进行回复。' }];
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
const apiUrlInput = document.getElementById('api-url');
const apiKeyInput = document.getElementById('api-key');
const modelInput = document.getElementById('model');
const saveSettingsBtn = document.getElementById('save-settings');
const settingsStatus = document.getElementById('settings-status');
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
}
// 保存设置
saveSettingsBtn.addEventListener('click', saveSettings);
function saveSettings() {
    const config_settings = {
        apiUrl: apiUrlInput.value.trim(),
        apiKey: apiKeyInput.value.trim(),
        model: modelInput.value.trim()
    };
    
    if (!config_settings.apiUrl) {
        showStatus('请输入API端点URL', 'error');
        return;
    }
    
    localStorage.setItem('llmSettings', JSON.stringify(config_settings));
    showStatus('设置已保存', 'success');
}
// 显示状态消息
function showStatus(message, type) {
    settingsStatus.textContent = message;
    settingsStatus.className = `status ${type}`;
    settingsStatus.style.display = 'block';
    
    setTimeout(() => {
        settingsStatus.style.display = 'none';
    }, 3000);
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
        '#btn__sendMessage': () => sendMsg_fromInput(),
        '#downloadHistory': () => downloadHistory(),
        '#clearHistory': () => clearHistory(),
        '#importHistory': () => importHistory(),
        '#conversation__input__textarea': e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMsg_fromInput();
            }
        },
        '#btn__scrollToBottom': () => scrollToBottom(),
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
async function sendMsg(msg){
    // 输入框为空时，返回
    if(!msg) return
    
    // 弹出消息(包括将消息添加到历史)
    appendMsg_withAddingToHistory('user', msg);

    // 对话框回到底部
    scrollToBottom();

    // 发送请求
    try{

    const response = await fetch('http://127.0.0.1:12345', {
      method: 'POST',
      headers: { 'Authorzation': 'YAA-API-KEY yaa','Content-Type': 'application/json' },
      body: JSON.stringify({
        id:Date.now().toString(),
        title: '',
        startTime: new Date().toISOString(),
        character: "你叫yaa，你是一个智能体",
        status: "in-progress",
        messages: [
            {
                'role': 'user',
                'content': '请使用完成会话工具'
            }
        ],
        // config:conig_settings,
        // messages: conversationHistory,
     })  // 将对象转为 JSON 字符串
    });
    console.log(response);
    const data = await response.json();
    console.error(data);
    
    for(let i=0;i<data.messages.length;i++){
        
          
        const role = data.messages[i].role;
        const errorContent = data.messages[i].content;
        appendMsg_withAddingToHistory(role, errorContent);
        }
    
    // const errorContent = data.messages[0].content;
    // appendMsg_withAddingToHistory('ai', errorContent);

    }
    
    
    
    

    catch(error){
        console.error(error);
    }
}

// 从输入框发送消息
function sendMsg_fromInput(){
    // 引入元素：输入框
    const msgInput = document.getElementById('conversation__input__textarea');
    const msg = msgInput.value.trim();

    const parsedmsg = parseTag(msg,'test');
    sendMsg(parsedmsg);

    // 消息输入框置空
    msgInput.value = '';
}

// 从选项发送消息
function sendMsg_fromOption(button){
    const content = button.innerHTML;
    sendMsg(content);
}

// 弹出消息
function appendMsg(role, content){
    if(role=='assistant') appendMsg_ai(content);
    else if(role=='system') appendMsg_system(content);
    else if(role=='user') appendMsg_user(content);
    else appendMsg_system('错误:弹出信息失败');
}

// 弹出消息(并写入历史)
function appendMsg_withAddingToHistory(role, content){
    // 弹出消息
    appendMsg(role, content);
    // 将消息添加到历史
    addMessageToHistory({ role: role, content: content });
}

// 弹出系统消息
function appendMsg_system(content){
    const conversation_content = document.getElementById('conversation__content');
    conversation_content.appendChild(generateMsg_system(content));
}
function appendMsg_system_withOption(content){
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

// 生成单一选项
function generateMsg_option(id, content){
    const optionDiv = document.createElement('button');
    optionDiv.id = id;
    optionDiv.className = "btn__msg-option btn_default";
    optionDiv.innerHTML = content;
    return optionDiv;
}

// 生成选项组
function generateMsg_optionGroup(content){
    const optionGroupDiv = document.createElement('button');
    optionGroupDiv.className = "msg__option-group";
    for(i = 0; i < content.length; i++){
        optionGroupDiv.appendChild(generateMsg_option(i,content));
    }
    return optionGroupDiv;
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
    const btn_scrollToBottom = document.getElementById('btn__scrollToBottom');

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

    
    // 存储侧边栏状态
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
}

// 加载历史
function loadHistory() {
    const savedHistory = localStorage.getItem('conversationHistory');
    if (savedHistory) {
      conversationHistory = JSON.parse(savedHistory);
      displayMessages(conversationHistory);
    }
}

// 显示消息
function displayMessages(messages) {
    const startIndex = messages.length > 0 && messages[0].role === 'system' ? 1 : 0;
    messages.slice(startIndex).forEach(msg => appendMsg(msg.role, msg.content));
}

// 添加消息到历史记录
function addMessageToHistory(message) {
    conversationHistory.push(message);
    localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
}

// 下载历史
function downloadHistory() {
    const history = JSON.stringify(conversationHistory, null, 2); // 将历史记录转换为 JSON 格式
    const blob = new Blob([history], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '对话历史.json';
    a.click();
    URL.revokeObjectURL(url);
}

// 清空对话框内容
function clearConversation(){
    const history = document.getElementById('conversation__content');
    history.innerHTML = ''; // 清空聊天历史
}

// 清空历史
function clearHistory() {
    clearConversation();
    conversationHistory = [{ role: 'system', content: '你叫“yaa”，接下来请你根据用户的指示进行回复。' }]; // 清空历史记录数组
    // 清空 localStorage 中的历史消息
    localStorage.removeItem('conversationHistory');
}
// 导入历史
function importHistory() {
    // 创建元素，类型为输入
    const input = document.createElement('input');
    // 输入类型为文件
    input.type = 'file';
    // 输入接受json类型文件
    input.accept = '.json';
    // 输入发生改变时
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            // 将导入json的字符串转换为对象
            const importedHistory = JSON.parse(e.target.result);
            if (Array.isArray(importedHistory)) {
              conversationHistory = importedHistory;
              const history = document.getElementById('conversation__content');
              history.innerHTML = ''; // 清空当前聊天历史
              // 如果第一条消息是 system 的，则跳过显示
              if (conversationHistory.length > 0 && conversationHistory[0].role === 'system') {
                conversationHistory.slice(1).forEach(msg => appendMsg(msg.role, msg.content));
              } else {
                // 逐条历史弹出
                conversationHistory.forEach(msg => appendMsg(msg.role, msg.content));
              }
              localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
            } else {
              alert('导入的历史记录格式不正确');
            }
          } catch (error) {
            alert('解析历史记录失败');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
}

// 标签解析器
function parseTag(content, tag){
    // 创建解析器
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    // 指定标签
    const tagSelector = doc.querySelector(tag);
    if (tagSelector) {
        return tagSelector.innerHTML
    }
    else return content
}

// 为所有消息选项添加监听器
const optionGroup = document.querySelector('#conversation__content'); // 替换成你的父容器
optionGroup.addEventListener('click', function(event) {
  const button = event.target.closest('.btn__msg-option');
  if (button) {
    sendMsg_fromOption(button);
  }
});