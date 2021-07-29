export type RecordTableListItem = {
  id: string;
  name: string;
  href: string;
  desc: string;
  time: string;
  avatar?: string;
  disabled?: boolean;
  owner?: string;
  callNo?: number;
  status?: string;
  progress?: number;
};

export type TableListData = {
  list: RecordTableListItem[];
  total: number;
  sucess: boolean;
};

export type TableListParams = {
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  currentPage?: number;
  filter?: Record<string, any[]>;
  sorter?: Record<string, any>;
};
