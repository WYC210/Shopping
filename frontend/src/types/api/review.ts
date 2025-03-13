export interface Review {
  reviewId: string;
  userId: string;
  content: string;
  rating: number;
  createdTime: string;
}

export interface ReviewResponse {
  status: number;
  data: {
    list: Review[];
    total: number;
  };
  message?: string;
} 