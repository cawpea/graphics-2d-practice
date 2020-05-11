
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
   * 敵キャラクターのインスタンス数
   */
  const ENEMY_MAX_COUNT = 10;

  /**
   * ショットの最大個数
   * @type {number}
   */
  const SHOT_MAX_COUNT = 10;

  /**
   * 敵キャラクターのショットの最大個数
   */
  const ENEMY_SHOT_MAX_COUNT = 50;

  /**
   * canvasの高さ
   * @type {number}
   */
  const CANVAS_HEIGHT = 480;
  let util;
  let canvas;
  let ctx;
  let scene;
  let startTime;
  let viper = null;

  /**
   * 敵キャラクターのインスタンスを格納する配列
   */
  let enemyArray = [];

  /**
   * ショットのインスタンスを格納する配列
   * @type {Array<Shot>}
   */
  let shotArray = [];

  /**
   * シングルショットのインスタンスを格納する配列
   * @type {Array<Shot>}
   */
  let singleShotArray = [];

  /**
   * 敵キャラクターのショットのインスタンスを格納する配列
   */
  let enemyShotArray = [];

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

  function sceneSetting() {
    scene.add('intro', (time) => {
      if (time > 2.0) {
        scene.use('invade');
      }
    });
    scene.add('invade', (time) => {
      if (scene.frame === 0) {
        for(let i = 0; i < ENEMY_MAX_COUNT; ++i) {
          if (enemyArray[i].life <= 0) {
            let e = enemyArray[i];
            e.set(CANVAS_WIDTH / 2, -e.height);
            e.setVector(0.0, 1.0);
            break;
          }
        }
      }
      if (scene.frame === 100) {
        scene.use('invade');
      }
    });
    scene.use('intro');
  }

  function initialize() {
    // canvasの大きさを設定
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    scene = new SceneManager();

    viper = new Viper(ctx, 0, 0, 64, 64, './image/viper.png');
    viper.setComing(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 100
    );

    for(let i = 0; i < ENEMY_MAX_COUNT; i++) {
      enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, './image/enemy_small.png');
    }

    for(let i = 0; i < SHOT_MAX_COUNT; i++) {
      shotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/viper_shot.png');
      singleShotArray[i * 2] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
      singleShotArray[i * 2 + 1] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
    }

    viper.setShotArray(shotArray, singleShotArray);

    for(let i = 0; i < ENEMY_SHOT_MAX_COUNT; i++) {
      enemyShotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/enemy_shot.png');
    }
    for(let i = 0; i < ENEMY_MAX_COUNT; i++) {
      enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, './image/enemy_small.png');
      enemyArray[i].setShotArray(enemyShotArray);
    }
  }

  function loadCheck() {
    let ready = true;
    ready = ready && viper.ready;
    enemyArray.map(v => {
      ready = ready && v.ready;
    });
    shotArray.map(v => {
      ready = ready && v.ready;
    });
    singleShotArray.map(v => {
      ready = ready && v.ready;
    });
    enemyShotArray.map(v => {
      ready = ready && v.ready;
    });

    if (ready) {
      eventSetting();
      sceneSetting();
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

    // シーンを更新する
    scene.update();

    // 自機キャラクターの状態を更新する
    viper.update();

    // 敵キャラクターの状態を更新する
    enemyArray.map((v) => {
      v.update();
    });

    // ショットの状態を更新する
    shotArray.map((v) => {
      v.update();
    });

    // シングルショットの状態を更新する
    singleShotArray.map((v) => {
      v.update();
    });

    // 敵キャラクターのショット状態を更新する
    enemyShotArray.map((v) => {
      v.update();
    });

    requestAnimationFrame(render);
  }
})();