import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Typography } from 'antd';
import styles from './Welcome.less';

const CodePreview: React.FC = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

export default (): React.ReactNode => {
  return (
    <PageContainer waterMarkProps={{}}>
      <Card className={styles.mainCard}>
        <h1>VBIDI = Video Based Intrusion Dectection Implementation</h1>

        <div style={{ height: '16px' }}></div>

        <Typography.Text>前端控制台</Typography.Text>
        <CodePreview>https://github.com/DogTorrent/VBIDI-AntD-Web</CodePreview>

        <div style={{ height: '16px' }}></div>

        <Typography.Text>核心计算服务</Typography.Text>
        <CodePreview>
          https://github.com/DogTorrent/Video-Based-Intrusion-Detection-Implementation
        </CodePreview>
      </Card>
    </PageContainer>
  );
};
