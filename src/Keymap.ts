const KeyMap: {
  [K: number]: boolean
} = {};

document.addEventListener('keydown', e => {
  KeyMap[e.keyCode] = true;
});

document.addEventListener('keyup', e => {
  KeyMap[e.keyCode] = false;
});

export default KeyMap;
