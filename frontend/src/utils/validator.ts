
interface ValidationResult {
  valid: boolean;
  message?: string;
}

export class Validator {
  // 验证邮箱
  validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return { 
      valid: emailRegex.test(email),
      message: emailRegex.test(email) ? '' : '邮箱格式不正确'
    };
  }

  // 验证手机号
  validatePhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  // 验证密码强度
  validatePassword(password: string): ValidationResult & { strength: number } {
    if (password.length < 6) {
      return {
        valid: false,
        message: '密码长度至少为6位',
        strength: 0
      };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;

    return {
      valid: strength >= 3,
      message: strength < 3 ? '密码需包含大小写字母、数字和特殊字符中的至少3种' : '',
      strength // 0-4 表示密码强度
    };
  }

  // 验证用户名
  validateUsername(username: string): ValidationResult {
    if (username.length < 3 || username.length > 20) {
      return {
        valid: false,
        message: '用户名长度应在3-20个字符之间'
      };
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return {
      valid: usernameRegex.test(username),
      message: usernameRegex.test(username) ? '' : '用户名只能包含字母、数字、下划线和连字符'
    };
  }

  // 验证URL
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const validator = new Validator();