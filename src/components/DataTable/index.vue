<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  total?: number
  page?: number
  pageSize?: number
  showPagination?: boolean
}

interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean
  formatter?: (row: any, column: any, cellValue: any) => any
  slot?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  total: 0,
  page: 1,
  pageSize: 20,
  showPagination: true
})

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'selection-change', selection: any[]): void
}>()

const currentPage = ref(props.page)
const currentPageSize = ref(props.pageSize)

const handlePageChange = (page: number) => {
  currentPage.value = page
  emit('page-change', page)
}

const handleSizeChange = (size: number) => {
  currentPageSize.value = size
  emit('size-change', size)
}
</script>

<template>
  <div class="data-table">
    <el-table
      v-loading="loading"
      :data="data"
      border
      stripe
      @selection-change="(val: any[]) => emit('selection-change', val)"
    >
      <el-table-column
        v-if="columns.some(c => c.slot === 'selection')"
        type="selection"
        width="55"
      />
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :fixed="col.fixed"
        :sortable="col.sortable"
      >
        <template v-if="col.slot" #default="scope">
          <slot :name="col.slot" :row="scope.row" :$index="scope.$index" />
        </template>
      </el-table-column>
    </el-table>

    <div v-if="showPagination" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
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

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
