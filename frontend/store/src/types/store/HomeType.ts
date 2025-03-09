// 基础类型定义
export interface Category {
  id?: string;
  categoryId: string;
  name: string;
  parentId?: string | null;
  children?: Category[];
  icon?: string;
  count?: number;
  level?: number;
  isActive?: boolean;
}

export interface FilterParams {
  categoryId: string | null;
  price: {
    min: number | null;
    max: number | null;
  };
  ratings: number[];
  tags: string[];
  keyword: string;
}

export interface SortParams {
  field: string;
  order: "asc" | "desc";
}

// 轮播项类型
export interface CarouselItem {
  image: string;
  title: string;
}