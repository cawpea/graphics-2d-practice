class Sound {
  constructor() {
    this.ctx = new AudioContext();
    this.source = null;
  }
  /**
   * オーディオファイルをロードする
   * @param {string} audioPath - オーディオファイルのパス
   * @param {function} callback - ファイルのロード完了時に呼ばれるコールバック関数
   */
  load(audioPath, callback) {
    fetch(audioPath)
    .then((response) => {
      return response.arrayBuffer();
    })
    .then((buffer) => {
      return this.ctx.decodeAudioData(buffer);
    })
    .then((decodeAudio) => {
      this.source = decodeAudio;
      callback();
    })
    .catch(() => {
      callback('error');
    });
  }
  /**
   * AudioBufferからAudioBufferSourceNodeを生成し、再生する
   */
  play() {
    let node = new AudioBufferSourceNode(this.ctx, {buffer: this.source});
    // ノードを接続する
    node.connect(this.ctx.destination);
    // ノードの再生が完了した後の解放処理
    node.addEventListener('ended', () => {
      node.stop();
      node.disconnect();
      node = null;
    });
    node.start();
  }
}
