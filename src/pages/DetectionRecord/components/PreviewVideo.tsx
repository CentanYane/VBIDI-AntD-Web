import React from 'react';
import { Modal } from 'antd';

type PreviewVideoProps = {
  modalVisible: boolean;
  onCancel: () => void;
  src: string;
};

const PreviewVideo: React.FC<PreviewVideoProps> = (props) => {
  const { modalVisible, onCancel } = props;

  return (
    <Modal
      destroyOnClose
      title="预览"
      visible={modalVisible}
      onCancel={() => onCancel()}
      footer={null}
    >
      {props.src.match('\\.(mp4|webm)$') !== null && (
        <video
          src={props.src}
          width="100%"
          height="auto"
          controls={true}
          autoPlay={true}
          style={{ borderRadius: '10px' }}
        ></video>
      )}
      {props.src.match('\\.(jpg|png|webp)$') !== null && (
        <img src={props.src} width="100%" height="auto" style={{ borderRadius: '10px' }}></img>
      )}
      {props.children}
    </Modal>
  );
};

export default PreviewVideo;
