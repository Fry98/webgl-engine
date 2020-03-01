const KeyMap = {};

document.addEventListener('keydown', e => {
  KeyMap[e.keyCode] = true;
});

document.addEventListener('keyup', e => {
  KeyMap[e.keyCode] = false;
});

export default KeyMap;
