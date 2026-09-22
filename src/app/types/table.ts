
export interface TableColumn {
  id: string;
  header: string;
  render?: (cellData: any, rowData: TableData) => React.ReactNode;
  columnClassName?: string; 
}

export interface TableData {
  [key: string]: any;
}