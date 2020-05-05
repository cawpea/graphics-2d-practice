
(function() {
  /**
   * キーの押下状態を調べるためのオブジェクト
   * @global
   * @type {object}
   */
  window.isKeyDown = {};

  /**
   * canvasの幅
   * @type {number}
   */
  const CANVAS_WIDTH = 640;

  /**
   * ショットの最大個数
   * @type {number}
   */
  const SHOT_MAX_COUNT = 10;

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
  /**
   * ショットのインスタンスを格納する配列
   * @type {Array<Shot>}
   */
  let shotArray = [];

  window.addEventListener('load', () => {
    util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
    canvas = util.canvas;
    ctx = util.context;

    initialize();
    loadCheck();
  });

  function eventSetting() {
    window.addEventListener('keydown', (event) => {
      isKeyDown[`key_${event.key}`] = true;
    }, false);
    window.addEventListener('keyup', (event) => {
      isKeyDown[`key_${event.key}`] = false;
    }, false);
  }

  function initialize() {
    // canvasの大きさを設定
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    viper = new Viper(ctx, 0, 0, 64, 64, './image/viper.png');
    viper.setComing(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 100
    );

    for(let i = 0; i < SHOT_MAX_COUNT; i++) {
      shotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/viper_shot.png');
    }

    viper.setShotArray(shotArray);
  }

  function loadCheck() {
    let ready = true;
    ready = ready && viper.ready;
    shotArray.map(v => {
      ready = ready && v.ready;
    });

    if (ready) {
      eventSetting();
      startTime = Date.now();
      render();
    } else {
      setTimeout(loadCheck, 100);
    }
  }

  function render() {
    ctx.globalAlpha = 1.0;
    util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');

    // 現在までの経過時間を秒単位で取得する
    let nowTime = (Date.now() - startTime) / 1000;

    // 自機キャラクターの状態を更新する
    viper.update();

    // ショットの状態を更新する
    shotArray.map((v) => {
      v.update();
    });

    requestAnimationFrame(render);
  }
})();