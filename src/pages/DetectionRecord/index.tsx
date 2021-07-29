/* eslint-disable @typescript-eslint/no-unused-vars */
// import { PlusOutlined } from '@ant-design/icons';
import { message } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
// import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import { record, updateRecord, removeRecord } from './service';
import type { RecordTableListItem } from './data';
import PreviewVideo from './components/PreviewVideo';
import { useBoolean } from '@umijs/hooks';
import { isNull } from 'lodash';

/**
 * 更新节点
 *
 * @param fields
 */

const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('正在配置');

  try {
    await updateRecord({
      name: fields.name,
      desc: fields.desc,
      key: fields.id,
    });
    hide();
    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败');
    return false;
  }
};
/**
 * 删除节点
 *
 * @param selectedRows
 */

const handleRemove = async (selectedRows: RecordTableListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  try {
    await removeRecord({
      key: selectedRows.map((row) => row.id),
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

/**
 * 跨域下载文件（需要服务器设置CORS头）
 * @param url
 * @param name
 */
const download = (url: string, name: string) => {
  if (!url) {
    message.error('URL错误');
  }
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobURL;
      a.target = '_blank';
      a.setAttribute('display', 'none');
      if (name && name.length) a.download = name;
      document.body.appendChild(a);
      a.click();
    })
    .catch((error) => message.error(error.message));
};

const TableList: React.FC = () => {
  /** 分布更新窗口的弹窗 */

  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<RecordTableListItem>();
  const [selectedRowsState, setSelectedRows] = useState<RecordTableListItem[]>([]);
  const previewVideoVisible = useBoolean(false);
  const [previewVideoSrc, setPreviewVideoSrc] = useState<string>('');
  /** 国际化配置 */

  const columns: ProColumns<RecordTableListItem>[] = [
    {
      title: '识别名称',
      dataIndex: 'name',
      valueType: 'textarea',
    },
    {
      title: '识别码',
      dataIndex: 'id',
      tip: '识别码是唯一的 key',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'desc',
      valueType: 'textarea',
    },
    {
      title: '抓取时间',
      dataIndex: 'time',
      valueType: 'dateTime',
    },
    {
      title: '截图/录像',
      dataIndex: 'href',
      valueType: 'option',
      render: (item, data) => {
        const { href, name, time, id } = data;

        if (href === undefined || !href) {
          return false;
        }

        return [
          isNull(href.match('\\.(mp4|webm|jpg|png|webp)$')) ? (
            <span></span>
          ) : (
            <a
              key="preview"
              onClick={() => {
                previewVideoVisible.setTrue();
                setPreviewVideoSrc(href);
              }}
            >
              预览
            </a>
          ),
          <a
            key="download"
            onClick={() => download(href, `${name}_${id}_${time.replace(' ', '_')}`)}
            style={{ right: 0 }}
          >
            下载
          </a>,
        ];
      },
    },
  ];

  return (
    <PageContainer waterMarkProps={{}}>
      <ProTable<RecordTableListItem>
        headerTitle="检测记录表格"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => []}
        request={record}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        className={styles.detectionTable}
      />
      {/* {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )} */}
      <UpdateForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);

          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setCurrentRow(undefined);
        }}
        updateModalVisible={updateModalVisible}
        values={currentRow || {}}
      />
      <PreviewVideo
        modalVisible={previewVideoVisible.state}
        onCancel={previewVideoVisible.setFalse}
        src={previewVideoSrc}
      ></PreviewVideo>

      {/* <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<RecordTableListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<RecordTableListItem>[]}
          />
        )}
      </Drawer> */}
    </PageContainer>
  );
};

export default TableList;
