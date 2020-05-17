/**
 * 座標を管理するためのクラス
 */
class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  /**
   * ベクトルの長さを返す静的メソッド
   * @param {number} x - X要素
   * @param {number} y - Y要素
   */
  static calcLength(x, y) {
    return Math.sqrt(x * x + y * y);
  }
  /**
   * ベクトルを単位化した結果を返す静的メソッド
   * @param {number} x - X要素
   * @param {number} y - Y要素
   */
  static calcNormal(x, y) {
    let len = Position.calcLength(x, y);
    return new Position(x / len, y / len);
  }
  set(x, y) {
    if(x) { this.x = x; }
    if(y) { this.y = y; }
  }
  /**
   * 対象の Position クラスのインスタンスとの距離を返す
   * @param {Position} target 
   */
  distance(target) {
    let x = this.x - target.x;
    let y = this.y - target.y;
    return Math.sqrt(x * x + y * y);
  }
}

/**
 * キャラクター管理のための基幹クラス
 */
class Character {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト 
   * @param {number} x - X座標 
   * @param {number} y - Y座標 
   * @param {number} life - キャラクターのライフ(生存フラグを兼ねる)
   * @param {Image} imagePath - キャラクターの画像のパス
   */
  constructor(ctx, x, y, w, h, life, imagePath) {
    this.ctx = ctx;
    this.position = new Position(x, y);
    this.vector = new Position(0.0, -1.0);
    this.angle = 270 * Math.PI / 180;
    this.width = w;
    this.height = h;
    this.life = life;
    this.ready = false;
    this.image = new Image();
    this.image.addEventListener('load', () => {
      this.ready = true;
    });
    this.image.src = imagePath;
  }
  setVector(x, y) {
    this.vector.set(x, y);
  }
  setVectorFromAngle(angle) {
    this.angle = angle;
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    this.vector.set(cos, sin);
  }
  draw() {
    let offsetX = this.width / 2;
    let offsetY = this.height / 2;
    this.ctx.drawImage(
      this.image,
      this.position.x - offsetX,
      this.position.y - offsetY,
      this.width,
      this.height
    )
  }
  rotationDraw() {
    // 座標系を回転する前の状態を保持する
    this.ctx.save();
    // 自身の位置が座標系の中心と重なるように平行移動する
    this.ctx.translate(this.position.x, this.position.y);
    // 座標系を回転させる
    this.ctx.rotate(this.angle - Math.PI * 1.5);

    let offsetX = this.width / 2;
    let offsetY = this.height / 2;

    // キャラクターの幅やオフセットする量を加味して描画する
    this.ctx.drawImage(
      this.image,
      -offsetX,
      -offsetY,
      this.width,
      this.height
    );
    // 座標系を回転する前の状態に戻す
    this.ctx.restore();
  }
}

class Viper extends Character {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト 
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @param {Image} image - キャラクターの画像 
   */
  constructor(ctx, x, y, w, h, image) {
    super(ctx, x, y, w, h, 0, image);
    this.speed = 3;
    this.shotCheckCounter = 0;
    this.shotInterval = 10;
    this.isComing = false;
    this.comingStart = null;
    this.comingStartPosition = null;
    this.comingEndPosition = null;
    this.shotArray = null;
    this.singleShotArray = null;
  }
  setComing(startX, startY, endX, endY) {
    this.life = 1;
    this.isComing = true;
    this.comingStart = Date.now();
    this.position.set(startX, startY);
    this.comingStartPosition = new Position(startX, startY);
    this.comingEndPosition = new Position(endX, endY);
  }
  setShotArray(shotArray, singleShotArray) {
    this.shotArray = shotArray;
    this.singleShotArray = singleShotArray;
  }
  update() {
    if (this.life <= 0) {
      return;
    }
    let justTime = Date.now();

    if (this.isComing) {
      let comingTime = (justTime - this.comingStart) / 1000;
      let y = this.comingStartPosition.y - comingTime * 50;

      if (y <= this.comingEndPosition.y) {
        this.isComing = false;
        y = this.comingEndPosition.y;
      }
      this.position.set(this.position.x, y);
      if (justTime % 100 < 50) {
        this.ctx.globalAlpha = 0.5;
      }
    } else {
      if (window.isKeyDown.key_ArrowLeft) {
        this.position.x -= this.speed;
      }
      if (window.isKeyDown.key_ArrowRight) {
        this.position.x += this.speed;
      }
      if (window.isKeyDown.key_ArrowUp) {
        this.position.y -= this.speed;
      }
      if (window.isKeyDown.key_ArrowDown) {
        this.position.y += this.speed;
      }
      let canvasWidth = this.ctx.canvas.width;
      let canvasHeight = this.ctx.canvas.height;
      let tx = Math.min(Math.max(this.position.x, 0), canvasWidth);
      let ty = Math.min(Math.max(this.position.y, 0), canvasHeight);
      this.position.set(tx, ty);

      if (window.isKeyDown.key_z && this.shotCheckCounter >= 0) {
        for (let i = 0; i < this.shotArray.length; i++) {
          if (this.shotArray[i].life <= 0) {
            this.shotArray[i].set(this.position.x, this.position.y);
            this.shotArray[i].setPower(2);
            // ショットを生成したのでインターバルを設定する
            this.shotCheckCounter = -this.shotInterval;
            // ひとつ生成したらループを抜ける
            break;
          }
        }
        for (let i = 0; i < this.singleShotArray.length; i += 2) {
          if (this.singleShotArray[i].life <= 0 && this.singleShotArray[i + 1].life <= 0) {
            let radCW = 280 * Math.PI / 180;
            let radCCW = 260 * Math.PI / 180;
            // 自機キャラクターの座標にショットを生成する
            this.singleShotArray[i].set(this.position.x, this.position.y);
            this.singleShotArray[i].setVectorFromAngle(radCW);
            this.singleShotArray[i + 1].set(this.position.x, this.position.y);
            this.singleShotArray[i + 1].setVectorFromAngle(radCCW);
            this.shotCheckCounter = -this.shotInterval;
            break;
          }
        }
      }
      ++this.shotCheckCounter;
    }

    this.draw();
    this.ctx.globalAlpha = 1.0;
  }
}

class Enemy extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath);
    /**
     * 自身のタイプ
     */
    this.type = 'default';
    /**
     * 自身が出現してからのフレーム数
     */
    this.frame = 0;
    this.speed = 3;
    this.shotArray = null;
    /**
     * 自身が攻撃の対象とする Character 由来のインスタンス
     */
    this.attackTarget = null;
  }
  set(x, y, life = 1, type = 'default') {
    this.position.set(x, y);
    this.life = life;
    this.type = type;
    this.frame = 0;
  }
  setShotArray(shotArray) {
    this.shotArray = shotArray;
  }
  /**
   * 攻撃対象を設定する
   * @param {Character} target - 自身が攻撃対象とするインスタンス
   */
  setAttackTarget(target) {
    this.attackTarget = target;
  }
  update() {
    if (this.life <= 0) {
      return;
    }

    switch(this.type) {
      case 'wave':
        if (this.frame % 60 === 0) {
          // 攻撃対象に向かうベクトル
          let tx = this.attackTarget.position.x - this.position.x;
          let ty = this.attackTarget.position.y - this.position.y;
          // ベクトルを単位化する
          let tv = Position.calcNormal(tx, ty);
          this.fire(tv.x, tv.y, 4.0);
        }
        // X座標はサイン波で、Y座標を一定量で変化する
        this.position.x += Math.sin(this.frame / 10);
        this.position.y += 2.0;

        if (this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0;
        }
        break;
      case 'large':
        if (this.frame % 50 === 0) {
          for (let i = 0; i < 360; i += 45) {
            let r = i * Math.PI / 180;
            let s = Math.sin(r);
            let c = Math.cos(r);
            this.fire(c, s, 3.0);
          }
        }
        // X座標はサイン波で、Y座標は一定量で変化する
        this.position.x += Math.sin((this.frame + 90) / 50) * 2.0;
        this.position.y += 1.0;

        if (this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0;
        }
        break;
      case 'default':
      default:
        if (this.frame === 100) {
          this.fire();
        }
        this.position.x += this.vector.x * this.speed;
        this.position.y += this.vector.y * this.speed;

        // 敵キャラクターが画面外（画面下端）へ移動していたらライフを0に設定する
        if (this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0;
        }
        break;
    }

    this.draw();

    ++this.frame;
  }
  /**
   * 自身から指定された方向にショットを放つ
   * @param {number} x - 進行方向ベクトルのx要素
   * @param {number} y - 進行方向ベクトルのy要素
   */
  fire(x = 0.0, y = 1.0) {
    for(let i = 0; i < this.shotArray.length; i++) {
      if (this.shotArray[i].life <= 0) {
        this.shotArray[i].set(this.position.x, this.position.y);
        this.shotArray[i].setSpeed(5.0);
        this.shotArray[i].setVector(x, y);
        break;
      }
    }
  }
}

class Shot extends Character {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト 
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @param {number} w - 幅
   * @param {number} h - 高さ
   * @param {Image} imagePath - キャラクター用の画像パス
   */
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath);
    this.speed = 7;
    this.vector = new Position(0.0, -1.0);
    this.power = 1;
    /**
     * 自身と衝突判定を取る対象を格納する
     * @type {Array<Character>}
     */
    this.targetArray = [];
    /**
     * 爆発エフェクトpのインスタンスを格納する
     * @type {Array<Explosion>}
     */
    this.explosionArray = [];
  }
  set(x, y) {
    this.position.set(x, y);
    this.life = 1;
  }
  setSpeed(speed) {
    if (!speed) {
      return;
    }
    this.speed = speed;
  }
  /**
   * ショットのスピードを判定する
   * @param {number} [power] - 設定する攻撃力 
   */
  setPower(power) {
    if (power == null || power <= 0) {
      return;
    }
    this.power = power;
  }
  /**
   * ショットが衝突判定を行う対象を設定する
   * @param {Array<Character>} [targets] - 衝突判定の対象を含む配列 
   */
  setTargets(targets) {
    if (targets == null || !Array.isArray(targets) || targets.length <= 0) {
      return;
    }
    this.targetArray = targets;
  }
  /**
   * ショットが爆発エフェクトを発生できるように設定する
   */
  setExplosions(targets) {
    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      return;
    }
    this.explosionArray = targets;
  }
  update() {
    if (this.life <= 0) { return; }

    // ショットが画面外へ移動していたらライフを0にする
    if (
      this.position.x + this.width < 0 ||
      this.position.x - this.width > this.ctx.canvas.width ||
      this.position.y + this.height < 0 ||
      this.position.y - this.height > this.ctx.canvas.height
    ) {
      this.life = 0;
    }
    // ショットを上に向かって移動させる
    this.position.x += this.vector.x * this.speed;
    this.position.y += this.vector.y * this.speed;

    // ショットと対象との衝突判定を行う
    this.targetArray.map((v) => {
      if (this.life <= 0 || v.life <= 0) {
        return;
      }
      let dist = this.position.distance(v.position);
      // 自身と対象の幅の1/4の距離まで近づいている場合、衝突とみなす
      if (dist <= (this.width + v.width) / 4) {
        // 自機キャラクターが対象の場合、isComingフラグによって無敵になる
        if (v instanceof Viper && v.isComing) {
          return;
        }
        v.life -= this.power; // 対象のライフを攻撃力分減算する

        if (v.life > 0) {
          this.life = 0;
        } else {
          for (let i = 0; i < this.explosionArray.length; i++) {
            // 発生していない爆発エフェクトがあれば対象の位置に発生する
            if (!this.explosionArray[i].life) {
              this.explosionArray[i].set(v.position.x, v.position.y);
              break;
            }
          }
          // もし対象が敵キャラクターの場合はスコアを加算する
          if (v instanceof Enemy) {
            let score = v.type === 'large' ? 1000 : 100;
            window.gameScore = Math.min(window.gameScore + score, 99999);
          }
        }
      }
    });

    // 座標系の回転を考慮した描画を行う
    this.rotationDraw();
  }
}

class Explosion {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
   * @param {number} radius - 爆発の広がりの半径
   * @param {number} count - 爆発の火花の数
   * @param {number} size - 爆発の火花の大きさ（幅・高さ）
   * @param {number} timeRange - 爆発が消えるまでの時間（秒単位）
   * @param {string} [color] - 爆発の色
   */
  constructor(ctx, radius, count, size, timeRange, color = '#ff1166') {
    this.ctx = ctx;
    this.life = false;
    this.color = color;
    this.position = null;
    this.radius = radius;
    this.count = count;
    this.startTime = 0;
    this.timeRange = timeRange;
    /**
     * 火花のひとつあたりの最大の大きさ（幅・高さ）
     */
    this.fireBaseSize = size;
    /**
     * 火花のひとつあたりの大きさを格納する
     */
    this.fireSize = [];
    /**
     * 火花の位置を格納する
     */
    this.firePosition = [];
    /**
     * 火花の進行方向を格納する
     */
    this.fireVector = [];
    /**
     * サウンド再生のためのSoundクラスのインスタンス
     * @type {Sound}
     */
    this.sound = null;
  }
  /**
   * 爆発エフェクトを設定する
   * @param {number} x - 爆発を発生させる X 座標
   * @param {number} y - 
   */
  set(x, y) {
    for (let i = 0; i < this.count; i++) {
      this.firePosition[i] = new Position(x, y);
      let vr = Math.random() * Math.PI * 2.0;
      let s = Math.sin(vr);
      let c = Math.cos(vr);
      // 進行方向の長さをランダムに短くし移動量をランダム化する
      let mr = Math.random();
      this.fireVector[i] = new Position(c * mr, s * mr);
      this.fireSize[i] = (Math.random() * 0.5 + 0.5) * this.fireBaseSize;
    }
    this.life = true;
    this.startTime = Date.now();

    if (this.sound) {
      this.sound.play();
    }
  }
  setSound(sound) {
    this.sound = sound;
  }
  update() {
    if (!this.life) {
      return;
    }
    this.ctx.fillStyle = this.color;
    this.ctx.globalAlpha = 0.5;

    // 爆発が発生してからの経過時間
    let time = (Date.now() - this.startTime) / 1000;
    // 爆発までの時間で正規化して進捗度合いを算出
    let ease = simpleEaseIn(1.0 - Math.min(time / this.timeRange, 1.0));
    let progress = 1.0 - ease;

    // 進捗度合いに応じた位置に火花を描画する
    for(let i = 0; i < this.firePosition.length; i++) {
      let d = this.radius * progress;
      let x = this.firePosition[i].x + this.fireVector[i].x * d;
      let y = this.firePosition[i].y + this.fireVector[i].y * d;
      // 進捗を描かれる大きさにも反映する
      let s = 1.0 - progress;

      this.ctx.fillRect(
        x - (this.fireSize[i] * s) / 2,
        y - (this.fireSize[i] * s) / 2,
        this.fireSize[i] * s,
        this.fireSize[i] * s
      );
    }
    if (progress >= 1.0) {
      this.life = false;
    }
  }
}

class BackgroundStar {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - 描画などに利用する2Dコンテキスト
   * @param {number} size - 星の大きさ（幅・高さ）
   * @param {number} speed - 星の移動速度
   * @param {string} [color] - 星の色
   */
  constructor(ctx, size, speed, color = '#FFFFFF') {
    this.ctx = ctx;
    this.size = size;
    this.speed = speed;
    this.color = color;
    this.position = null;
  }
  /**
   * 星を設定する
   * @param {number} x - 星を発生させるX座標
   * @param {number} y - 星を発生させるY座標
   */
  set(x, y) {
    this.position = new Position(x, y);
  }
  update() {
    this.ctx.fillStyle = this.color;
    this.position.y += this.speed;
    this.ctx.fillRect(
      this.position.x - this.size / 2,
      this.position.y - this.size / 2,
      this.size,
      this.size
    );
    // 画面下端よりも外に出てしまっていたら上橋側に戻す
    if (this.position.y + this.size > this.ctx.canvas.height) {
      this.position.y = -this.size;
    }
  }
}

function simpleEaseIn(t) {
  return t * t * t * t;
}