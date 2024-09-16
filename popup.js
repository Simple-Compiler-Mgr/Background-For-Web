document.getElementById('applyWallpaper').addEventListener('click', () => {
  const file = document.getElementById('wallpaperInput').files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'setWallpaper', imageData: reader.result});
      });
    }
    reader.readAsDataURL(file);
  }
});

document.getElementById('applyBlur').addEventListener('click', () => {
  const blurValue = document.getElementById('blurRange').value;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'setBlur', blurValue: blurValue});
  });
});

document.getElementById('blurRange').addEventListener('input', (e) => {
  document.getElementById('blurValue').textContent = e.target.value;
});

document.getElementById('opacityRange').addEventListener('input', (e) => {
  document.getElementById('opacityValue').textContent = e.target.value + '%';
});

document.getElementById('applySettings').addEventListener('click', () => {
  const blurValue = document.getElementById('blurRange').value;
  const opacityValue = document.getElementById('opacityRange').value;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'setSettings',
      blurValue: blurValue,
      opacityValue: opacityValue
    });
  });
});