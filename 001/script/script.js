
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
  let viper = null;

  window.addEventListener('load', () => {
    util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
    canvas = util.canvas;
    ctx = util.context;

    util.imageLoader('./image/viper.png', (loadedImage) => {
      image = loadedImage;
      initialize();
      eventSetting();
      startTime = Date.now();
      render();
    });
  });

  function eventSetting() {
    window.addEventListener('keydown', (event) => {
      if (viper.isComing) { return; }

      switch(event.key) {
        case 'ArrowLeft':
          viper.position.x -= 10;
          break;
        case 'ArrowRight':
          viper.position.x += 10;
          break;
        case 'ArrowUp':
          viper.position.y -= 10;
          break;
        case 'ArrowDown':
          viper.position.y += 10;
          break;
      }
    }, false)
  }

  function initialize() {
    // canvasの大きさを設定
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    viper = new Viper(ctx, 0, 0, 64, 64, image);
    viper.setComing(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 100
    )
  }

  function render() {
    ctx.globalAlpha = 1.0;
    util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');

    // 現在までの経過時間を秒単位で取得する
    let nowTime = (Date.now() - startTime) / 1000;

    // 自機キャラクターの状態を更新する
    viper.update();

    requestAnimationFrame(render);
  }
})();