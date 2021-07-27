import React from 'react';
import Mpegts from 'mpegts.js';

interface MpegtsVideoProps {
  mediaDataSource: Mpegts.MediaDataSource;
  config?: Mpegts.Config;
  autoPlay?: boolean;
  controls?: boolean;
  onProgress?: () => void;
  className?: string;
}

class MpegtsVideo extends React.Component<MpegtsVideoProps> {
  videoRef = React.createRef<HTMLVideoElement>();
  player = Mpegts.createPlayer(this.props.mediaDataSource, this.props.config);

  componentDidMount() {
    if (this.videoRef.current && Mpegts.isSupported()) {
      this.player.attachMediaElement(this.videoRef.current);
      this.player.load();
      this.player.play();
      this.player.on('pause', () => {});
    }
  }

  render() {
    return (
      <video
        className={this.props.className}
        ref={this.videoRef}
        onProgress={this.props.onProgress}
        autoPlay={this.props.autoPlay}
        controls={this.props.controls}
      >
        <canvas id="testcanvas"></canvas>
      </video>
    );
  }
}

export default MpegtsVideo;
