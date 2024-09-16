document.getElementById('blurRange').addEventListener('input', (e) => {
  document.getElementById('blurValue').textContent = e.target.value;
});

document.getElementById('opacityRange').addEventListener('input', (e) => {
  document.getElementById('opacityValue').textContent = e.target.value + '%';
});

document.getElementById('applySettings').addEventListener('click', () => {
  const blurValue = document.getElementById('blurRange').value;
  const opacityValue = document.getElementById('opacityRange').value;
  window.parent.postMessage({
    type: 'setSettings',
    blurValue: blurValue,
    opacityValue: opacityValue
  }, '*');
});

document.getElementById('applyWallpaper').addEventListener('click', () => {
  const file = document.getElementById('wallpaperInput').files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = function() {
      window.parent.postMessage({
        type: 'setWallpaper',
        imageData: reader.result
      }, '*');
    }
    reader.readAsDataURL(file);
  }
});