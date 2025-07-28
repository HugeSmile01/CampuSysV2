/**
 * Security utilities for CampuSysV2
 * Provides input validation, sanitization, and security features
 */

class SecurityManager {
    constructor() {
        this.rateLimitMap = new Map();
        this.maxAttempts = 5;
        this.lockoutTime = 15 * 60 * 1000; // 15 minutes
    }

    /**
     * Sanitize HTML input to prevent XSS attacks
     */
    sanitizeHTML(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 254;
    }

    /**
     * Validate password strength
     */
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];
        
        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }
        if (!hasUpperCase) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!hasLowerCase) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!hasNumbers) {
            errors.push('Password must contain at least one number');
        }
        if (!hasSpecialChar) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            strength: this.calculatePasswordStrength(password)
        };
    }

    /**
     * Calculate password strength score
     */
    calculatePasswordStrength(password) {
        let score = 0;
        
        // Length bonus
        score += Math.min(password.length * 4, 25);
        
        // Character variety bonus
        if (/[a-z]/.test(password)) score += 5;
        if (/[A-Z]/.test(password)) score += 5;
        if (/[0-9]/.test(password)) score += 5;
        if (/[^A-Za-z0-9]/.test(password)) score += 10;
        
        // Common patterns penalty
        if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
        if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns
        
        score = Math.max(0, Math.min(100, score));
        
        if (score < 30) return 'weak';
        if (score < 60) return 'medium';
        if (score < 80) return 'strong';
        return 'very-strong';
    }

    /**
     * Rate limiting implementation
     */
    checkRateLimit(identifier, action = 'general') {
        const key = `${identifier}_${action}`;
        const now = Date.now();
        
        if (!this.rateLimitMap.has(key)) {
            this.rateLimitMap.set(key, { attempts: 1, lastAttempt: now });
            return { allowed: true, attemptsRemaining: this.maxAttempts - 1 };
        }
        
        const record = this.rateLimitMap.get(key);
        
        // Reset if lockout period has passed
        if (now - record.lastAttempt > this.lockoutTime) {
            this.rateLimitMap.set(key, { attempts: 1, lastAttempt: now });
            return { allowed: true, attemptsRemaining: this.maxAttempts - 1 };
        }
        
        if (record.attempts >= this.maxAttempts) {
            const timeRemaining = Math.ceil((this.lockoutTime - (now - record.lastAttempt)) / 1000 / 60);
            return { 
                allowed: false, 
                attemptsRemaining: 0,
                timeRemaining: timeRemaining
            };
        }
        
        record.attempts += 1;
        record.lastAttempt = now;
        
        return { 
            allowed: true, 
            attemptsRemaining: this.maxAttempts - record.attempts 
        };
    }

    /**
     * Generate secure session token
     */
    generateSecureToken(length = 32) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const values = new Uint8Array(length);
        crypto.getRandomValues(values);
        
        for (let i = 0; i < length; i++) {
            result += charset[values[i] % charset.length];
        }
        
        return result;
    }

    /**
     * Validate file uploads
     */
    validateFileUpload(file, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
        const errors = [];
        
        if (file.size > maxSize) {
            errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        }
        
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            errors.push(`File type ${file.type} is not allowed`);
        }
        
        // Check for potentially dangerous file extensions
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js'];
        const fileName = file.name.toLowerCase();
        
        for (const ext of dangerousExtensions) {
            if (fileName.endsWith(ext)) {
                errors.push('This file type is not allowed for security reasons');
                break;
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Set security headers (for demonstration - would be done server-side in production)
     */
    setSecurityHeaders() {
        // Content Security Policy
        const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://cdn.jsdelivr.net https://code.getmdl.io",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self' https://*.googleapis.com https://*.firebase.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ].join('; ');
        
        // Add meta tag for CSP (fallback)
        const metaCSP = document.createElement('meta');
        metaCSP.httpEquiv = 'Content-Security-Policy';
        metaCSP.content = csp;
        document.head.appendChild(metaCSP);
        
        // Other security headers (would be set server-side)
        console.log('Security headers that should be set server-side:');
        console.log('X-Frame-Options: DENY');
        console.log('X-Content-Type-Options: nosniff');
        console.log('X-XSS-Protection: 1; mode=block');
        console.log('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        console.log('Referrer-Policy: strict-origin-when-cross-origin');
    }

    /**
     * Log security events
     */
    logSecurityEvent(event, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.log('Security Event:', logEntry);
        
        // In production, this would send to a security monitoring service
        // this.sendToSecurityMonitoring(logEntry);
    }
}

// Initialize security manager
const securityManager = new SecurityManager();

// Set security headers on page load
document.addEventListener('DOMContentLoaded', () => {
    securityManager.setSecurityHeaders();
});

// Export for use in other modules
window.SecurityManager = SecurityManager;
window.securityManager = securityManager;