
(function() {
  /**
   * キーの押下状態を調べるためのオブジェクト
   * @global
   * @type {object}
   */
  window.isKeyDown = {};

  /**
   * スコアを格納する
   * @global
   * @type {number}
   */
  window.gameScore = 0;

  /**
   * canvasの幅
   * @type {number}
   */
  const CANVAS_WIDTH = 640;

  /**
   * 敵キャラクター（小）のインスタンス数
   */
  const ENEMY_SMALL_MAX_COUNT = 20;

  /**
   * 敵キャラクター（大）のインスタンス数
   */
  const ENEMY_LARGE_MAX_COUNT = 5;

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
   * 爆発エフェクトの最大個数
   */
  const EXPLOSION_MAX_COUNT = 10;

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

  /**
   * 爆発エフェクトのインスタンスを格納する配列
   */
  let explosionArray = [];

  /**
   * 再スタートするためのフラグ
   * @type {boolean}
   */
  let restart = false;

  window.addEventListener('load', () => {
    util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
    canvas = util.canvas;
    ctx = util.context;

    initialize();
    loadCheck();
  });

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

    for(let i = 0; i < EXPLOSION_MAX_COUNT; i++) {
      explosionArray[i] = new Explosion(ctx, 50.0, 15, 30.0, 0.25);
    }

    for(let i = 0; i < SHOT_MAX_COUNT; i++) {
      shotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/viper_shot.png');
      singleShotArray[i * 2] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
      singleShotArray[i * 2 + 1] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
    }

    viper.setShotArray(shotArray, singleShotArray);

    for(let i = 0; i < ENEMY_SHOT_MAX_COUNT; i++) {
      enemyShotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/enemy_shot.png');
      enemyShotArray[i].setTargets([viper]);
      enemyShotArray[i].setExplosions(explosionArray);
    }
    for (let i = 0; i < ENEMY_SMALL_MAX_COUNT; i++) {
      enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, './image/enemy_small.png');
      enemyArray[i].setShotArray(enemyShotArray);
      enemyArray[i].setAttackTarget(viper);
    }
    for(let i = 0; i < ENEMY_LARGE_MAX_COUNT; i++) {
      enemyArray[ENEMY_SMALL_MAX_COUNT + i] = new Enemy(ctx, 0, 0, 64, 64, './image/enemy_large.png');
      enemyArray[ENEMY_SMALL_MAX_COUNT + i].setShotArray(enemyShotArray);
      enemyArray[ENEMY_SMALL_MAX_COUNT + i].setAttackTarget(viper);
    }

    // 衝突判定を行うために対象を設定する
    for(let i = 0; i < SHOT_MAX_COUNT; i++) {
      shotArray[i].setTargets(enemyArray);
      singleShotArray[i * 2].setTargets(enemyArray);
      singleShotArray[i * 2 + 1].setTargets(enemyArray);
      shotArray[i].setExplosions(explosionArray);
      singleShotArray[i * 2].setExplosions(explosionArray);
      singleShotArray[i * 2 + 1].setExplosions(explosionArray);
    }
  }

  function eventSetting() {
    window.addEventListener('keydown', (event) => {
      isKeyDown[`key_${event.key}`] = true;
      // ゲームオーバーから再スタートするための設定
      if (event.key === 'Enter' && viper.life <= 0) {
        restart = true;
      }
    }, false);
    window.addEventListener('keyup', (event) => {
      isKeyDown[`key_${event.key}`] = false;
    }, false);
  }

  function sceneSetting() {
    scene.add('intro', (time) => {
      if (time > 3.0) {
        scene.use('invade_default_type');
      }
    });
    scene.add('invade', (time) => {
      if (scene.frame === 0) {
        for(let i = 0; i < ENEMY_MAX_COUNT; ++i) {
          if (enemyArray[i].life <= 0) {
            let e = enemyArray[i];
            e.set(CANVAS_WIDTH / 2, -e.height, 2, 'default');
            e.setVector(0.0, 1.0);
            break;
          }
        }
      }
      if (scene.frame === 100) {
        scene.use('invade');
      }
      if (viper.life <= 0) {
        scene.use('gameover');
      }
    });
    scene.add('invade_default_type', (time) => {
      if (scene.frame % 30 === 0) {
        for (let i = 0; i < ENEMY_SMALL_MAX_COUNT; i++) {
          if (enemyArray[i].life <= 0) {
            let e = enemyArray[i];
            if (scene.frame % 60 === 0) {
              // 左側面から出てくる
              e.set(-e.width, 30, 2, 'default');
              e.setVectorFromAngle(degreesToRadians(30));
            } else {
              // 右側面から出てくる
              e.set(CANVAS_WIDTH + e.width, 30, 2, 'default');
              e.setVectorFromAngle(degreesToRadians(150));
            }
            break;
          }
        }
      }
      if (scene.frame === 270) {
        scene.use('blank');
      }
      if (viper.life <= 0) {
        scene.use('gameover');
      }
    });
    scene.add('blank', (time) => {
      if (scene.frame === 150) {
        scene.use('invade_wave_move_type');
      }
      if (viper.life <= 0) {
        scene.use('gameover');
      }
    });
    scene.add('invade_wave_move_type', (time) => {
      if (scene.frame % 50 === 0) {
        for (let i = 0; i < ENEMY_SMALL_MAX_COUNT; i++) {
          if (enemyArray[i].life <= 0) {
            let e = enemyArray[i];
            if (scene.frame <= 200) {
              // 左側を進む
              e.set(CANVAS_WIDTH * 0.2, -e.height, 2, 'wave');
            } else {
              // 右側を進む
              e.set(CANVAS_WIDTH * 0.8, -e.height, 2, 'wave');
            }
            break;
          }
        }
      }
      if (scene.frame === 450) {
        scene.use('invade_large_type');
      }
      if (viper.life <= 0) {
        scene.use('gameover');
      }
    });
    scene.add('invade_large_type', (time) => {
      if (scene.frame === 100) {
        let i = ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT;
        for (let j = ENEMY_SMALL_MAX_COUNT; j < i; j++) {
          if (enemyArray[j].life <= 0) {
            let e = enemyArray[j];
            e.set(CANVAS_WIDTH / 2, -e.height, 50, 'large');
            break;
          }
        }
      }
      if (scene.frame === 500) {
        scene.use('intro');
      }
      if (viper.life <= 0) {
        scene.use('gameover');
      }
    });
    scene.add('gameover', (time) => {
      let textWidth = CANVAS_WIDTH / 2;
      let loopWidth = CANVAS_WIDTH + textWidth;
      // フレーム数に対する除算の余剰を計算し、文字列の位置とする
      let x = CANVAS_WIDTH - (scene.frame * 2) % loopWidth;

      ctx.font = 'bold 72px sans-serif';
      util.drawText('GAME OVER', x, CANVAS_HEIGHT / 2, '#FF0000', textWidth);

      if (restart) {
        restart = false;
        window.gameScore = 0;
        viper.setComing(
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT + 50,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT - 100
        );
        scene.use('intro');
      }
    });
    scene.use('intro');
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

    // スコアの表示
    ctx.font = 'bold 24px monospace';
    util.drawText(zeroPadding(window.gameScore, 5), 30, 50, '#111111');

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

    // 爆発エフェクトの状態を更新する
    explosionArray.map((v) => {
      v.update();
    });

    requestAnimationFrame(render);
  }

  /**
   * 度数法の角度からラジアンを生成する
   * @param {number} degrees - 度数法の度数
   */
  function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  /**
   * 数値の不足した桁数をゼロで埋めた文字数を返す
   * @param {number} number - 数値
   * @param {number} count - 桁数(２桁以上)
   */
  function zeroPadding(number, count) {
    let zeroArray = new Array(count);
    let zeroString = zeroArray.join('0') + number;
    return zeroString.slice(-count);
  }
})();