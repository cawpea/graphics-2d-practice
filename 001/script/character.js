/**
 * 座標を管理するためのクラス
 */
class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  set(x, y) {
    if(x) { this.x = x; }
    if(y) { this.y = y; }
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
   * @param {Image} image - キャラクターの画像 
   */
  constructor(ctx, x, y, life, image) {
    this.ctx = ctx;
    this.position = new Position(x, y);
    this.life = life;
    this.image = image;
  }
  draw() {
    this.ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y
    )
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
  constructor(ctx, x, y, image) {
    super(ctx, x, y, 0, image);
    this.isComing = false;
    this.comingStart = null;
    this.comingStartPosition = null;
    this.comingEndPosition = null;
  }
  setComing(startX, startY, endX, endY) {
    this.isComing = true;
    this.comingStart = Date.now();
    this.position.set(startX, startY);
    this.comingStartPosition = new Position(startX, startY);
    this.comingEndPosition = new Position(endX, endY);
  }
  update() {
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
    }

    this.draw();
    this.ctx.globalAlpha = 1.0;
  }
}