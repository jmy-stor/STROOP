// 颜色映射
const COLOR_MAPPING = {
    "red": { name: "红色", key: "H", code: "#e74c3c" },
    "purple": { name: "紫色", key: "Z", code: "#9b59b6" },
    "blue": { name: "蓝色", key: "L", code: "#3498db" },
    "pink": { name: "粉色", key: "F", code: "#e84393" },
    "orange": { name: "橙色", key: "C", code: "#e67e22" }
};

// 词汇列表
const WORDS = [
    "红色", "红色", "红色", "红色",
    "紫色", "紫色", "紫色", "紫色",
    "蓝色", "蓝色", "蓝色", "蓝色",
    "粉色", "粉色", "粉色", "粉色",
    "橙色", "橙色", "橙色", "橙色"
];

// 状态管理
let state = {
    currentTrial: 0,
    trials: [],
    startTime: 0,
    resultsPerPage: 5,
    currentPage: 1
};

// DOM元素
const elements = {
    rulesPage: document.getElementById('rules-page'),
    testPage: document.getElementById('test-page'),
    resultsPage: document.getElementById('results-page'),
    startBtn: document.getElementById('start-btn'),
    wordDisplay: document.getElementById('word-display'),
    keyFeedback: document.getElementById('key-feedback'), // 新增按键反馈元素
    progressCount: document.getElementById('progress-count'),
    summary: document.getElementById('summary'),
    resultsBody: document.getElementById('results-body'),
    prevPageBtn: document.getElementById('prev-page'),
    nextPageBtn: document.getElementById('next-page'),
    currentPageSpan: document.getElementById('current-page'),
    totalPagesSpan: document.getElementById('total-pages'),
    saveBtn: document.getElementById('save-btn'),
    restartBtn: document.getElementById('restart-btn')
};

// 初始化
function init() {
    // 设置事件监听器
    elements.startBtn.addEventListener('click', startTest);
    elements.prevPageBtn.addEventListener('click', () => changePage(-1));
    elements.nextPageBtn.addEventListener('click', () => changePage(1));
    elements.saveBtn.addEventListener('click', saveResults);
    elements.restartBtn.addEventListener('click', restartTest);
    
    // 监听键盘事件
    document.addEventListener('keydown', handleKeyPress);
    
    // 显示欢迎信息
    console.log("斯特鲁普测试已初始化！");
}

// 开始测试
function startTest() {
    console.log("测试开始");
    // 重置状态
    state.currentTrial = 0;
    state.trials = [];
    state.currentPage = 1;
    
    // 打乱词汇顺序
    shuffleArray(WORDS);
    
    // 显示测试页面
    elements.rulesPage.classList.remove('active');
    elements.testPage.classList.add('active');
    elements.resultsPage.classList.remove('active');
    
    // 开始第一个测试
    startTrial();
}

// 开始单个测试
function startTrial() {
    // 更新进度显示
    elements.progressCount.textContent = state.currentTrial + 1;
    
    // 获取当前词汇
    const currentWord = WORDS[state.currentTrial];
    
    // 随机选择一个颜色（不能与词汇意义相同）
    const availableColors = Object.keys(COLOR_MAPPING).filter(color => color !== currentWord);
    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    
    // 显示词汇
    elements.wordDisplay.textContent = currentWord;
    elements.wordDisplay.style.color = COLOR_MAPPING[randomColor].code;
    
    // 记录开始时间
    state.startTime = Date.now();
}

// 处理按键事件
function handleKeyPress(event) {
    console.log("检测到按键:", event.key, "时间:", Date.now());
    
    // 检查测试页面是否激活
    const isTestPageActive = elements.testPage.classList.contains('active');
    console.log("测试页面激活状态:", isTestPageActive);
    
    if (!isTestPageActive) {
        console.log("当前不在测试页面，忽略按键");
        return;
    }
    
    // 转换按键为大写
    const key = event.key.toUpperCase();
    console.log("处理按键:", key);
    
    // 检查是否有效按键
    if (!['H', 'Z', 'L', 'F', 'C'].includes(key)) {
        console.log("无效按键:", key);
        return;
    }
    
    // 更新按键反馈
    if (elements.keyFeedback) {
        elements.keyFeedback.textContent = `已按: ${key}`;
        elements.keyFeedback.style.color = '#27ae60';
        elements.keyFeedback.style.fontWeight = 'bold';
        
        setTimeout(() => {
            elements.keyFeedback.textContent = "请按键: H, Z, L, F, C";
            elements.keyFeedback.style.color = '#3498db';
            elements.keyFeedback.style.fontWeight = 'normal';
        }, 300);
    }
    
    // 计算反应时间
    const reactionTime = Date.now() - state.startTime;
    console.log("反应时间:", reactionTime, "ms");
    
    // 获取当前显示的颜色并转换为十六进制
    const rgbColor = elements.wordDisplay.style.color;
    const hexColor = rgbToHex(rgbColor);
    
    // 获取当前显示的词汇和颜色
    const displayedWord = elements.wordDisplay.textContent;
    const displayedColor = Object.keys(COLOR_MAPPING).find(
        color => COLOR_MAPPING[color].code.toLowerCase() === hexColor.toLowerCase()
    );
    
    console.log("当前词汇:", displayedWord, "显示颜色:", displayedColor, "原始颜色:", rgbColor, "转换后:", hexColor);
    
    // 检查是否正确
    if (!displayedColor) {
        console.error("无法识别的颜色:", hexColor);
        return;
    }
    
    const expectedKey = COLOR_MAPPING[displayedColor].key;
    const isCorrect = key === expectedKey;
    
    console.log("预期按键:", expectedKey, "是否正确:", isCorrect);
    
    // 记录测试结果
    state.trials.push({
        word: displayedWord,
        color: COLOR_MAPPING[displayedColor].name,
        reactionTime: reactionTime,
        isCorrect: isCorrect
    });
    
    // 进入下一个测试或显示结果
    state.currentTrial++;
    if (state.currentTrial < WORDS.length) {
        startTrial();
    } else {
        showResults();
    }
}
// 辅助函数：将RGB颜色转换为十六进制
function rgbToHex(rgb) {
    // 如果是十六进制格式，直接返回
    if (rgb.startsWith("#")) return rgb;
    
    // 提取RGB值
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*\d+\.?\d*)?\)$/i);
    
    if (match) {
        const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
        const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
        const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
        
        return `#${r}${g}${b}`;
    }
    
    console.warn("无法解析的颜色格式:", rgb);
    return rgb; // 返回原始值作为后备
}

// 显示结果
function showResults() {
    // 切换到结果页面
    elements.testPage.classList.remove('active');
    elements.resultsPage.classList.add('active');
    
    // 计算统计数据
    const totalTrials = state.trials.length;
    const correctTrials = state.trials.filter(trial => trial.isCorrect).length;
    const averageTime = state.trials.reduce((sum, trial) => sum + trial.reactionTime, 0) / totalTrials;
    const accuracy = (correctTrials / totalTrials) * 100;
    
    // 显示摘要
    elements.summary.innerHTML = `
        <p>测试完成!</p>
        <p>平均反应时间: <strong>${averageTime.toFixed(0)}ms</strong></p>
        <p>正确率: <strong>${accuracy.toFixed(1)}%</strong> (${correctTrials}/${totalTrials})</p>
        <p>错误次数: <strong>${totalTrials - correctTrials}</strong></p>
    `;
    
    // 显示详细结果
    renderResultsTable();
}

// 渲染结果表格
function renderResultsTable() {
    // 清空表格
    elements.resultsBody.innerHTML = '';
    
    // 计算分页
    const totalPages = Math.ceil(state.trials.length / state.resultsPerPage);
    const startIndex = (state.currentPage - 1) * state.resultsPerPage;
    const endIndex = Math.min(startIndex + state.resultsPerPage, state.trials.length);
    
    // 更新分页显示
    elements.currentPageSpan.textContent = state.currentPage;
    elements.totalPagesSpan.textContent = totalPages;
    
    // 禁用/启用分页按钮
    elements.prevPageBtn.disabled = state.currentPage === 1;
    elements.nextPageBtn.disabled = state.currentPage === totalPages;
    
    // 填充表格
    for (let i = startIndex; i < endIndex; i++) {
        const trial = state.trials[i];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${trial.word}</td>
            <td style="color: ${getColorCode(trial.color)}; font-weight: bold;">${trial.color}</td>
            <td>${trial.reactionTime}ms</td>
            <td class="${trial.isCorrect ? 'correct' : 'incorrect'}">
                <i class="fa-solid ${trial.isCorrect ? 'fa-check' : 'fa-xmark'}"></i> 
                ${trial.isCorrect ? '正确' : '错误'}
            </td>
        `;
        
        elements.resultsBody.appendChild(row);
    }
}

// 改变结果页面
function changePage(delta) {
    const newPage = state.currentPage + delta;
    const totalPages = Math.ceil(state.trials.length / state.resultsPerPage);
    
    if (newPage >= 1 && newPage <= totalPages) {
        state.currentPage = newPage;
        renderResultsTable();
    }
}

// 保存结果
function saveResults() {
    // 创建结果文本
    let resultText = "斯特鲁普效应测试结果\n\n";
    resultText += `测试时间: ${new Date().toLocaleString()}\n`;
    resultText += `测试次数: ${state.trials.length}\n\n`;
    
    // 添加摘要
    const correctTrials = state.trials.filter(trial => trial.isCorrect).length;
    const averageTime = state.trials.reduce((sum, trial) => sum + trial.reactionTime, 0) / state.trials.length;
    const accuracy = (correctTrials / state.trials.length) * 100;
    
    resultText += `=== 测试摘要 ===\n`;
    resultText += `平均反应时间: ${averageTime.toFixed(0)}ms\n`;
    resultText += `正确率: ${accuracy.toFixed(1)}%\n`;
    resultText += `正确次数: ${correctTrials}\n`;
    resultText += `错误次数: ${state.trials.length - correctTrials}\n\n`;
    
    // 添加详细结果
    resultText += `=== 详细结果 ===\n`;
    state.trials.forEach((trial, index) => {
        resultText += `第${index + 1}次: ${trial.word} - ${trial.color}, ${trial.reactionTime}ms, ${trial.isCorrect ? '正确' : '错误'}\n`;
    });
    
    // 创建下载链接
    const blob = new Blob([resultText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `stroop-test-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// 重新开始测试
function restartTest() {
    state.currentPage = 1;
    elements.resultsPage.classList.remove('active');
    elements.rulesPage.classList.add('active');
}

// 辅助函数：获取颜色代码
function getColorCode(colorName) {
    for (const color in COLOR_MAPPING) {
        if (COLOR_MAPPING[color].name === colorName) {
            return COLOR_MAPPING[color].code;
        }
    }
    return '#000000';
}

// 辅助函数：数组洗牌
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 初始化应用
window.addEventListener('DOMContentLoaded', init);