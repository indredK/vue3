<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  type?: 'selection' | 'index' | 'expand'
  sortable?: boolean
  formatter?: (row: any, column: any, cellValue: any) => string
  slots?: {
    default?: string
    header?: string
  }
  showOverflowTooltip?: boolean
  align?: 'left' | 'center' | 'right'
  fixed?: boolean | 'left' | 'right'
}

export interface TableAction {
  code: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  size?: 'large' | 'default' | 'small'
  icon?: string
  disabled?: boolean
  divided?: boolean
  confirm?: string
}

export interface DataTableProps {
  columns: TableColumn[]
  data: any[]
  loading?: boolean
  selection?: boolean
  index?: boolean
  expand?: boolean
  actions?: TableAction[]
  actionWidth?: string | number
  actionFixed?: boolean | 'left' | 'right'
  pagination?: boolean
  page?: number
  pageSize?: number
  pageSizes?: number[]
  total?: number
  loadingText?: string
  emptyText?: string
  rowKey?: string
  defaultSort?: { prop: string; order: string }
}

const props = withDefaults(defineProps<DataTableProps>(), {
  loading: false,
  selection: false,
  index: false,
  expand: false,
  actions: () => [],
  actionWidth: '180',
  actionFixed: 'right',
  pagination: true,
  page: 1,
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100],
  total: 0,
  loadingText: '加载中...',
  emptyText: '暂无数据',
  rowKey: 'id'
})

const emit = defineEmits<{
  (e: 'selection-change', selection: any[]): void
  (e: 'sort-change', sort: { prop: string; order: string }): void
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'action', action: TableAction, row: any): void
}>()

const userStore = useUserStore()

const visibleColumns = computed(() => {
  return props.columns.filter(col => col.type !== 'selection' && col.type !== 'index' && col.type !== 'expand')
})

const visibleActions = computed(() => {
  return props.actions.filter(action => {
    if (!action.code) return true
    return userStore.hasPermission(action.code)
  })
})

const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  emit('sort-change', { prop, order })
}

const handlePageChange = (page: number) => {
  emit('page-change', page)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleAction = (action: TableAction, row: any) => {
  emit('action', action, row)
}
</script>

<template>
  <div class="data-table">
    <el-table
      :data="data"
      :loading="loading"
      :loading-text="loadingText"
      :empty-text="emptyText"
      :row-key="rowKey"
      :default-sort="defaultSort"
      stripe
      border
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column v-if="selection" type="selection" width="50" />
      <el-table-column v-if="index" type="index" label="序号" width="60" align="center" />
      <el-table-column v-if="expand" type="expand">
        <template #default="{ row }">
          <slot name="expand" :row="row" />
        </template>
      </el-table-column>

      <template v-for="column in visibleColumns" :key="column.prop">
        <el-table-column
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :sortable="column.sortable"
          :show-overflow-tooltip="column.showOverflowTooltip"
          :align="column.align || 'left'"
          :fixed="column.fixed"
        >
          <template #header>
            <slot :name="`header-${column.prop}`" :column="column">
              {{ column.label }}
            </slot>
          </template>
          <template #default="{ row }">
            <slot :name="column.prop" :row="row" :column="column">
              <template v-if="column.formatter">
                {{ column.formatter(row, column, row[column.prop]) }}
              </template>
              <template v-else>
                {{ row[column.prop] }}
              </template>
            </slot>
          </template>
        </el-table-column>
      </template>

      <el-table-column
        v-if="visibleActions.length > 0"
        label="操作"
        :width="actionWidth"
        :fixed="actionFixed"
        align="center"
      >
        <template #default="{ row }">
          <slot name="actions" :row="row">
            <div class="action-buttons">
              <template v-for="(action, index) in visibleActions" :key="action.code || index">
                <el-divider v-if="action.divided && index > 0" direction="vertical" />
                <el-tooltip
                  v-if="action.disabled"
                  :content="action.label"
                  placement="top"
                >
                  <span>
                    <el-button
                      :type="action.type || 'primary'"
                      :size="action.size || 'small'"
                      :link="action.type === 'text'"
                      :disabled="action.disabled"
                    >
                      {{ action.label }}
                    </el-button>
                  </span>
                </el-tooltip>
                <el-button
                  v-else
                  :type="action.type || 'primary'"
                  :size="action.size || 'small'"
                  :link="action.type === 'text'"
                  @click="handleAction(action, row)"
                >
                  {{ action.label }}
                </el-button>
              </template>
            </div>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="pagination" class="pagination-container">
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.data-table {
  width: 100%;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
