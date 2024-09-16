// 创建一个覆盖层来应用背景和效果
const overlay = document.createElement('div');
overlay.id = 'custom-bg-overlay';

// 创建设置按钮
const settingsButton = document.createElement('button');
settingsButton.id = 'custom-bg-settings-btn';
settingsButton.textContent = '设置';

// 创建阅读模式按钮
const readerModeButton = document.createElement('button');
readerModeButton.id = 'custom-bg-reader-mode-btn';
readerModeButton.textContent = '阅读模式';

// 创建设置面板
const settingsPanel = document.createElement('div');
settingsPanel.id = 'custom-bg-settings-panel';
settingsPanel.style.display = 'none';
settingsPanel.innerHTML = `
  <div class="custom-bg-settings-container">
    <h2>自定义背景设置</h2>
    <div class="setting">
      <label for="wallpaperInput">选择背景图片：</label>
      <input type="file" id="wallpaperInput" accept="image/*">
      <button id="applyWallpaper" class="btn">应用壁纸</button>
    </div>
    <div class="setting">
      <label for="blurRange">模糊效果：</label>
      <input type="range" id="blurRange" min="0" max="20" value="0">
      <span id="blurValue">0</span>
    </div>
    <div class="setting">
      <label for="opacityRange">透明度：</label>
      <input type="range" id="opacityRange" min="0" max="100" value="100">
      <span id="opacityValue">100%</span>
    </div>
    <button id="applySettings" class="btn btn-primary">应用设置</button>
  </div>
`;

// 创建阅读模式面板
const readerModePanel = document.createElement('div');
readerModePanel.id = 'custom-bg-reader-mode-panel';
readerModePanel.style.display = 'none';

// 存储当前设置
let currentSettings = {
  imageData: '',
  blurValue: 0,
  opacityValue: 100
};

// 应用背景和效果的函数
function applyBackgroundAndEffects(imageData, blurValue, opacityValue) {
  currentSettings = { imageData, blurValue, opacityValue };
  
  overlay.style.backgroundImage = imageData ? `url(${imageData})` : 'none';
  overlay.style.filter = `blur(${blurValue}px)`;
  overlay.style.opacity = opacityValue / 100;

  // 保存设置到 Chrome storage
  chrome.storage.local.set({ currentSettings }, () => {
    console.log('Settings saved');
  });
}

// 修改添加元素到页面的函数
function addElementsToPage() {
  document.body.insertBefore(overlay, document.body.firstChild);
  document.body.appendChild(settingsButton);
  document.body.appendChild(readerModeButton);
  document.body.appendChild(settingsPanel);
  document.body.appendChild(readerModePanel);

  // 立即添加事件监听器
  addEventListeners();
}

// 修改添加事件监听器的函数
function addEventListeners() {
  console.log('Adding event listeners');
  
  settingsButton.addEventListener('click', (e) => {
    console.log('Settings button clicked');
    e.stopPropagation();
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
  });

  readerModeButton.addEventListener('click', (e) => {
    console.log('Reader mode button clicked');
    e.stopPropagation();
    toggleReaderMode();
  });

  document.getElementById('applyWallpaper').addEventListener('click', () => {
    console.log('Apply wallpaper button clicked');
    const file = document.getElementById('wallpaperInput').files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = function() {
        applyBackgroundAndEffects(reader.result, currentSettings.blurValue, currentSettings.opacityValue);
      }
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('blurRange').addEventListener('input', (e) => {
    document.getElementById('blurValue').textContent = e.target.value;
  });

  document.getElementById('opacityRange').addEventListener('input', (e) => {
    document.getElementById('opacityValue').textContent = e.target.value + '%';
  });

  document.getElementById('applySettings').addEventListener('click', () => {
    console.log('Apply settings button clicked');
    const blurValue = document.getElementById('blurRange').value;
    const opacityValue = document.getElementById('opacityRange').value;
    applyBackgroundAndEffects(currentSettings.imageData, blurValue, opacityValue);
  });
}

// 切换阅读模式
function toggleReaderMode() {
  if (readerModePanel.style.display === 'none') {
    const content = extractContent();
    readerModePanel.innerHTML = `
      <div class="reader-mode-content">
        <button id="close-reader-mode" class="reader-mode-btn">关闭阅读模式</button>
        <button id="back-to-original" class="reader-mode-btn">返回原页面</button>
        <h1>${document.title}</h1>
        ${content}
      </div>
    `;
    readerModePanel.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 防止背景滚动

    document.getElementById('close-reader-mode').addEventListener('click', () => {
      readerModePanel.style.display = 'none';
      document.body.style.overflow = ''; // 恢复滚动
    });

    document.getElementById('back-to-original').addEventListener('click', () => {
      window.scrollTo(0, window.pageYOffset);
      readerModePanel.style.display = 'none';
      document.body.style.overflow = ''; // 恢复滚动
    });
  } else {
    readerModePanel.style.display = 'none';
    document.body.style.overflow = ''; // 恢复滚动
  }
}

// 提取页面内容
function extractContent() {
  const article = findMainContent();
  if (!article) return '<p>无法提取有效内容，请返回原页面。</p>';

  const clonedArticle = article.cloneNode(true);
  
  // 移除可能的广告和无关内容
  removeUnwantedElements(clonedArticle);

  // 获取所有文本节点和元素
  const content = [];
  const treeWalker = document.createTreeWalker(clonedArticle, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);
  
  while(treeWalker.nextNode()) {
    const node = treeWalker.currentNode;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text.length > 0) {
        content.push(`<p>${text}</p>`);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'IMG') {
        content.push(`<figure class="reader-mode-image-container">${node.outerHTML}<figcaption>${node.alt || '图片'}</figcaption></figure>`);
      } else if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.tagName)) {
        content.push(node.outerHTML);
      } else if (node.tagName === 'A') {
        content.push(`<a href="${node.href}" target="_blank">${node.textContent}</a>`);
      } else if (['UL', 'OL'].includes(node.tagName)) {
        content.push(node.outerHTML);
      }
    }
  }

  return content.join('');
}

// 查找主要内容
function findMainContent() {
  const selectors = [
    'article',
    '[role="main"]',
    '.main-content',
    '#main-content',
    '.post',
    '.article',
    '.content',
    '#content'
  ];

  for (let selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }

  return document.body; // 如果找不到特定元素，返回整个 body
}

// 移除不需要的元素
function removeUnwantedElements(element) {
  const unwantedSelectors = [
    'script',
    'style',
    'iframe',
    'noscript',
    'svg',
    '.ad',
    '.ads',
    '.advertisement',
    '.banner',
    '.social-share',
    '.related-articles',
    '.comments',
    'aside'
  ];

  unwantedSelectors.forEach(selector => {
    element.querySelectorAll(selector).forEach(el => el.remove());
  });
}

// 初始化设置
function initializeSettings() {
  chrome.storage.local.get('currentSettings', (result) => {
    console.log('Retrieved settings:', result.currentSettings);
    if (result.currentSettings) {
      applyBackgroundAndEffects(
        result.currentSettings.imageData,
        result.currentSettings.blurValue,
        result.currentSettings.opacityValue
      );
    }
  });
}

// 修改主函数
function main() {
  console.log('Main function called');
  addElementsToPage();
  initializeSettings();
}

// 确保在DOM加载完成后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

// 添加这行代码来检查脚本是否正在运行
console.log('Content script is running');