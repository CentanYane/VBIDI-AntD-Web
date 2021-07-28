import Mpegts from 'mpegts.js';
import React from 'react';

interface MpegtsVideoProps {
  mediaDataSource: Mpegts.MediaDataSource;
  config?: Mpegts.Config;
  autoPlay?: boolean;
  controls?: boolean;
  onProgress?: (player?: Mpegts.Player, video?: React.RefObject<HTMLVideoElement>) => void;
  onPlay?: (player?: Mpegts.Player, video?: React.RefObject<HTMLVideoElement>) => void;
  onPause?: (player?: Mpegts.Player, video?: React.RefObject<HTMLVideoElement>) => void;
  onPlayerLoadingComplete?: (player?: Mpegts.Player) => void;
  className?: string;
}

class MpegtsVideo extends React.Component<MpegtsVideoProps> {
  videoRef = React.createRef<HTMLVideoElement>();
  player = Mpegts.createPlayer(this.props.mediaDataSource, this.props.config);
  isPlayerInit = false;

  componentDidMount() {
    if (this.videoRef.current && Mpegts.isSupported() && !this.isPlayerInit) {
      this.player.attachMediaElement(this.videoRef.current);
      this.player.load();
      this.player.play();
      this.player.on(Mpegts.Events.ERROR, () => {
        this.isPlayerInit = false;
      });
      this.player.on(Mpegts.Events.LOADING_COMPLETE, () => {
        this.isPlayerInit = true;
        if (this.props.onPlayerLoadingComplete) this.props.onPlayerLoadingComplete(this.player);
      });
    }
  }

  componentWillUnmount() {
    if (this.isPlayerInit) {
      this.player.detachMediaElement();
      this.player.pause();
      this.player.unload();
      this.player.destroy();
      this.isPlayerInit = false;
    }
  }

  render() {
    return (
      <video
        className={this.props.className}
        ref={this.videoRef}
        onProgress={() => {
          if (this.props.onProgress) this.props.onProgress(this.player, this.videoRef);
        }}
        autoPlay={this.props.autoPlay}
        controls={this.props.controls}
        onPlay={() => {
          if (this.props.onPlay) this.props.onPlay(this.player, this.videoRef);
        }}
        onPause={() => {
          if (this.props.onPause) this.props.onPause(this.player, this.videoRef);
        }}
      ></video>
    );
  }
}

export default MpegtsVideo;
