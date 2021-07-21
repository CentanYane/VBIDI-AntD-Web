import { GithubOutlined, AntDesignOutlined } from '@ant-design/icons';
import Footer from '@ant-design/pro-layout/lib/Footer';

export default () => {
  return (
    <Footer
      copyright="2021 VBIDI 开发团队 ｜ 由 Ant Design Pro 强力驱动 "
      links={[
        {
          key: 'VBIDI Repo',
          title: <span><GithubOutlined/> VBIDI</span>,
          href: 'https://github.com/DogTorrent/VBIDI',
          blankTarget: true,
        },
        {
          key: 'Ant Design Pro',
          title: <span><AntDesignOutlined/> Ant Design Pro</span>,
          href: 'https://pro.ant.design',
          blankTarget: true,
        },
      ]}
    />
  );
};
