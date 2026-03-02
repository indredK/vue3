import request from '@/utils/request'
import type { Order, OrderForm, OrderStatistics, Attachment, Remark } from '@/types/order'

export interface OrderListParams {
  page: number
  size: number
  orderNo?: string
  orderType?: string
  status?: string
  customerName?: string
  startDate?: string
  endDate?: string
}

export interface OrderListResponse {
  list: Order[]
  total: number
  page: number
  size: number
}

export function getOrderListApi(params: OrderListParams) {
  return request<OrderListResponse>({
    url: '/order/list',
    method: 'get',
    params
  })
}

export function getOrderDetailApi(id: number) {
  return request<Order>({
    url: `/order/${id}`,
    method: 'get'
  })
}

export function createOrderApi(data: OrderForm) {
  return request<Order>({
    url: '/order',
    method: 'post',
    data
  })
}

export function updateOrderApi(id: number, data: OrderForm) {
  return request<Order>({
    url: `/order/${id}`,
    method: 'put',
    data
  })
}

export function deleteOrderApi(id: number) {
  return request({
    url: `/order/${id}`,
    method: 'delete'
  })
}

export function updateOrderStatusApi(id: number, status: string) {
  return request({
    url: `/order/${id}/status`,
    method: 'put',
    data: { status }
  })
}

export function addOrderAttachmentApi(orderId: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request<Attachment>({
    url: `/order/${orderId}/attachment`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function deleteOrderAttachmentApi(orderId: number, attachmentId: number) {
  return request({
    url: `/order/${orderId}/attachment/${attachmentId}`,
    method: 'delete'
  })
}

export function addOrderRemarkApi(orderId: number, content: string) {
  return request<Remark>({
    url: `/order/${orderId}/remark`,
    method: 'post',
    data: { content }
  })
}

export function deleteOrderRemarkApi(orderId: number, remarkId: number) {
  return request({
    url: `/order/${orderId}/remark/${remarkId}`,
    method: 'delete'
  })
}

export function getOrderStatisticsApi(params?: { startDate?: string; endDate?: string }) {
  return request<OrderStatistics>({
    url: '/order/statistics',
    method: 'get',
    params
  })
}

export function getOrderStatusTransitionsApi(orderId: number) {
  return request<{ availableTransitions: string[] }>({
    url: `/order/${orderId}/transitions`,
    method: 'get'
  })
}
