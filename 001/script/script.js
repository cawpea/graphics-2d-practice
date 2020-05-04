
(function() {
  /**
   * canvasの幅
   * @type {number}
   */
  const CANVAS_WIDTH = 640;

  /**
   * canvasの高さ
   * @type {number}
   */
  const CANVAS_HEIGHT = 480;
  let util;
  let canvas;
  let ctx;
  let startTime;

  window.addEventListener('load', () => {
    util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
    canvas = util.canvas;
    ctx = util.context;

    util.imageLoader('./image/viper.png', (loadedImage) => {
      image = loadedImage;
      initialize();
      startTime = Date.now();
      render();
    });
  });
  function initialize() {
    // canvasの大きさを設定
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
  }

  function render() {
    util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');

    // 現在までの経過時間を秒単位で取得する
    let nowTime = (Date.now() - startTime) / 1000;
    // 時間の経過が見た目でわかりやすいように自機をサイン波で動かす
    let s = Math.sin(nowTime);
    // サインやコサインは半径1の円を基準にしており、得られる範囲が-1.0~1.0になるため、効果がわかりやすいように100倍する
    let x = s * 100.0;

    ctx.drawImage(image, CANVAS_WIDTH / 2 + x, CANVAS_HEIGHT / 2);

    requestAnimationFrame(render);
  }
})();