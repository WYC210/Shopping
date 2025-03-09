interface ErrorResponse {
  status: number;
  data: {
    message?: string;
    [key: string]: any;
  };
}

interface ApiError {
  response?: ErrorResponse;
  request?: any;
  message?: string;
  type?: string;
  stack?: string;
}

interface ErrorInfo {
  type: string;
  message: string;
}

class ErrorHandler {
  private errorMap: Map<string, string>;

  constructor() {
    this.errorMap = new Map([
      ['AUTH_ERROR', '认证失败'],
      ['NETWORK_ERROR', '网络错误'],
      ['VALIDATION_ERROR', '数据验证失败'],
      ['SERVER_ERROR', '服务器错误'],
      ['NOT_FOUND', '资源不存在']
    ]);
  }

  // 处理API错误
  handleApiError(error: ApiError): ErrorInfo {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 400:
          return {
            type: 'VALIDATION_ERROR',
            message: data.message || '请求参数错误'
          };
        case 401:
          return {
            type: 'AUTH_ERROR',
            message: '登录已过期，请重新登录'
          };
        case 403:
          return {
            type: 'AUTH_ERROR',
            message: '没有权限访问'
          };
        case 404:
          return {
            type: 'NOT_FOUND',
            message: '请求的资源不存在'
          };
        case 500:
          return {
            type: 'SERVER_ERROR',
            message: '服务器内部错误'
          };
        default:
          return {
            type: 'UNKNOWN_ERROR',
            message: '未知错误'
          };
      }
    }

    if (error.request) {
      return {
        type: 'NETWORK_ERROR',
        message: '网络请求失败'
      };
    }

    return {
      type: 'UNKNOWN_ERROR',
      message: error.message || '发生错误'
    };
  }

  // 处理业务错误
  handleBusinessError(error: { type: string; message: string }): ErrorInfo {
    const errorInfo = this.errorMap.get(error.type) || error.message;
    return {
      type: error.type,
      message: errorInfo
    };
  }

  // 记录错误
  logError(error: ApiError, context: Record<string, any> = {}): void {
    console.error('Error:', {
      message: error.message,
      type: error.type,
      stack: error.stack,
      context
    });
  }
}

export const errorHandler = new ErrorHandler();
