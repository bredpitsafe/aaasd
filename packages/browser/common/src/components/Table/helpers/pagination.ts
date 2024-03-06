import type { TablePaginationConfig } from 'antd/lib/table/interface';

export function getPaginationPropValue(
    data?: object[],
    pageSize = 100,
): TablePaginationConfig | false | undefined {
    return data && data.length > pageSize
        ? {
              defaultPageSize: pageSize,
              pageSize: pageSize,
              showSizeChanger: false,
          }
        : false;
}
