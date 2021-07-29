/* eslint-disable @typescript-eslint/no-unused-vars */
// import { PlusOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
// import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { record } from './service';
import { useMount } from '@umijs/hooks';
import React, { useState } from 'react';
import type { ColumnConfig } from '@ant-design/charts';
import { Column } from '@ant-design/charts';
import ProCard from '@ant-design/pro-card';
import styles from './index.less';

const StatisticsPage: React.FC = () => {
  type ColumnChartDataItemType = {
    date: string;
    count: string;
  };

  const [dateAndCountData, setDateAndCountData] = useState<ColumnChartDataItemType[]>([]);

  const refreshDateAndCountData = async () => {
    try {
      const result = await record();
      const tempData: ColumnChartDataItemType[] = [];
      const tempDataMap = new Map<string, number>();
      result.data.forEach((item) => {
        if (item.time) {
          const preCount = tempDataMap.get(item.time) || 0;
          tempDataMap.set(item.time, preCount + 1);
        }
      });
      tempDataMap.forEach((count, date) => {
        tempData.push({ date, count: `${count}` });
      });
      setDateAndCountData(tempData);
    } catch (error) {
      message.error(error.message);
    }
  };
  const config: ColumnConfig = {
    data: dateAndCountData,
    xField: 'date',
    yField: 'count',
    columnWidthRatio: dateAndCountData.length > 10 ? 0.5 : 0.3,
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: false,
        autoRotate: false,
      },
    },
    meta: {
      date: { alias: '日期' },
      count: { alias: '记录数量' },
    },
  };

  useMount(refreshDateAndCountData);
  return (
    <PageContainer waterMarkProps={{}}>
      <ProCard
        title="分时段记录统计"
        extra={<Button onClick={refreshDateAndCountData}>刷新</Button>}
        className={styles.statisticsCard}
      >
        <Column {...config} />
      </ProCard>
    </PageContainer>
  );
};

export default StatisticsPage;
