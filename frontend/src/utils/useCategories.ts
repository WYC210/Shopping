
import { serviceRegistry } from '@/api'
export const useCategories = () => {
  const categoryService = serviceRegistry.category
  const fetchCategories = async () => {
    try {
      return await categoryService.getCategoryTree()
    } catch (error) {
      console.error('获取分类失败:', error)
      return []
    }
  }

  return { fetchCategories }
}