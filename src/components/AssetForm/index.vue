<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FieldDefinition } from '@/types/assetType'

interface Props {
  fields: FieldDefinition[]
  modelValue?: Record<string, any>
  mode?: 'create' | 'edit' | 'view'
}

const props = withDefaults(defineProps<Props>(), {
  fields: () => [],
  modelValue: () => ({}),
  mode: 'create'
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'submit': [value: Record<string, any>]
}>()

const formData = reactive<Record<string, any>>({})

watch(() => props.modelValue, (newVal) => {
  Object.keys(newVal).forEach(key => {
    formData[key] = newVal[key]
  })
}, { immediate: true, deep: true })

watch(formData, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

const visibleFields = computed(() => {
  return props.fields
    .filter(f => f.visible)
    .sort((a, b) => a.sort - b.sort)
})

const getFieldValue = (field: FieldDefinition) => {
  return formData[field.code] ?? field.defaultValue ?? null
}

const setFieldValue = (field: FieldDefinition, value: any) => {
  formData[field.code] = value
}

const handleSubmit = () => {
  emit('submit', { ...formData })
}

defineExpose({
  formData,
  handleSubmit
})
</script>

<template>
  <div class="asset-form">
    <el-form label-width="120px" :disabled="mode === 'view'">
      <el-row :gutter="20">
        <el-col 
          v-for="field in visibleFields" 
          :key="field.code" 
          :span="field.type === 'textarea' ? 24 : 12"
        >
          <el-form-item 
            :label="field.name" 
            :required="field.required"
          >
            <!-- 文本输入 -->
            <el-input
              v-if="field.type === 'text'"
              :model-value="getFieldValue(field)"
              :placeholder="`请输入${field.name}`"
              :disabled="mode === 'view' || (!field.editable && mode === 'edit')"
              @update:model-value="setFieldValue(field, $event)"
            />
            
            <!-- 多行文本 -->
            <el-input
              v-else-if="field.type === 'textarea'"
              type="textarea"
              :model-value="getFieldValue(field)"
              :placeholder="`请输入${field.name}`"
              :rows="3"
              :disabled="mode === 'view' || (!field.editable && mode === 'edit')"
              @update:model-value="setFieldValue(field, $event)"
            />
            
            <!-- 数字输入 -->
            <el-input-number
              v-else-if="field.type === 'number'"
              :model-value="getFieldValue(field)"
              :placeholder="`请输入${field.name}`"
              :disabled="mode === 'view' || (!field.editable && mode === 'edit')"
              style="width: 100%"
              @update:model-value="setFieldValue(field, $event)"
            />
            
            <!-- 日期选择 -->
            <el-date-picker
              v-else-if="field.type === 'date'"
              type="date"
              :model-value="getFieldValue(field)"
              :placeholder="`请选择${field.name}`"
              :disabled="mode === 'view' || (!field.editable && mode === 'edit')"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              @update:model-value="setFieldValue(field, $event)"
            />
            
            <!-- 日期时间选择 -->
            <el-date-picker
              v-else-if="field.type === 'datetime'"
              type="datetime"
              :model-value="getFieldValue(field)"
              :placeholder="`请选择${field.name}`"
              :disabled="mode === 'view' || (!field.editable && mode === 'edit')"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
              @update:model-value="setFieldValue(field, $event)"
            />
            
            <!-- 下拉选择 -->
            <el-select
              v-else-if="field.type === 'select'"
              :model-value="getFieldValue(field)"
              :placeholder="`请选择${field.name}`"
              :disabled="mode === 'view' || (!field.editable && mode === 'edit')"
              style="width: 100%"
              @update:model-value="setFieldValue(field, $event)"
            >
              <el-option
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
                :disabled="option.disabled"
              />
            </el-select>
            
            <!-- 多选 -->
            <el-select
              v-else-if="field.type === 'multiselect'"
              multiple
              :model-value="getFieldValue(field)"
              :placeholder="`请选择${field.name}`"
              :disabled="mode === 'view' || (!field.editable && mode === 'edit')"
              style="width: 100%"
              @update:model-value="setFieldValue(field, $event)"
            >
              <el-option
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
                :disabled="option.disabled"
              />
            </el-select>
            
            <!-- 开关 -->
            <el-switch
              v-else-if="field.type === 'switch'"
              :model-value="getFieldValue(field)"
              :disabled="mode === 'view' || (!field.editable && mode === 'edit')"
              @update:model-value="setFieldValue(field, $event)"
            />
            
            <!-- 文件上传 -->
            <el-upload
              v-else-if="field.type === 'file'"
              :disabled="mode === 'view'"
              :auto-upload="false"
              :limit="1"
              drag
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                拖拽文件到此处或<em>点击上传</em>
              </div>
            </el-upload>
            
            <!-- 图片上传 -->
            <el-upload
              v-else-if="field.type === 'image'"
              :disabled="mode === 'view'"
              :auto-upload="false"
              :limit="1"
              list-type="picture-card"
              accept="image/*"
            >
              <el-icon><plus /></el-icon>
            </el-upload>
            
            <!-- 默认输入框 -->
            <el-input
              v-else
              :model-value="getFieldValue(field)"
              :placeholder="`请输入${field.name}`"
              :disabled="mode === 'view' || (!field.editable && mode === 'edit')"
              @update:model-value="setFieldValue(field, $event)"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<style scoped>
.asset-form {
  padding: 20px;
}
</style>
