// A silent sink. Only the microphone input is copied; nothing is played back.
class KhutbahFrames extends AudioWorkletProcessor {
  constructor() {
    super();
    this.length = Math.round(sampleRate * 0.04);
    this.frame = new Float32Array(this.length);
    this.offset = 0;
  }

  process(inputs) {
    const channel = inputs[0][0];
    if (!channel) return true;
    let start = 0;
    while (start < channel.length) {
      const count = Math.min(this.length - this.offset, channel.length - start);
      this.frame.set(channel.subarray(start, start + count), this.offset);
      start += count;
      this.offset += count;
      if (this.offset === this.length) {
        this.port.postMessage(this.frame, [this.frame.buffer]);
        this.frame = new Float32Array(this.length);
        this.offset = 0;
      }
    }
    return true;
  }
}

registerProcessor('khutbah-frames', KhutbahFrames);
