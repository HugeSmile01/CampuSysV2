/**
 * Two-Factor Authentication (2FA) System for CampuSysV2
 * Provides enhanced security with TOTP, SMS, and backup codes
 */

class TwoFactorAuth {
    constructor() {
        this.totpSecrets = new Map();
        this.backupCodes = new Map();
        this.smsVerification = new Map();
        this.trustedDevices = new Map();
        this.verificationAttempts = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserPreferences();
    }

    /**
     * Enable 2FA for a user
     */
    async enable2FA(userId, method = 'totp') {
        try {
            const setup = await this.initiate2FASetup(userId, method);
            return {
                success: true,
                setup: setup,
                qrCode: method === 'totp' ? await this.generateQRCode(setup.secret, userId) : null,
                backupCodes: this.generateBackupCodes(userId),
                instructions: this.get2FAInstructions(method)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Initiate 2FA setup
     */
    async initiate2FASetup(userId, method) {
        const setup = {
            userId: userId,
            method: method,
            secret: null,
            phoneNumber: null,
            enabled: false,
            createdAt: new Date()
        };

        switch (method) {
            case 'totp':
                setup.secret = this.generateTOTPSecret();
                setup.issuer = 'CampuSysV2';
                setup.accountName = `${userId}@campusys.edu`;
                break;
            
            case 'sms':
                // In real implementation, this would validate phone number
                setup.phoneNumber = '+1234567890'; // Placeholder
                break;
            
            case 'email':
                setup.email = `${userId}@campusys.edu`;
                break;
            
            default:
                throw new Error('Unsupported 2FA method');
        }

        return setup;
    }

    /**
     * Generate TOTP secret
     */
    generateTOTPSecret() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 32; i++) {
            secret += chars[Math.floor(Math.random() * chars.length)];
        }
        return secret;
    }

    /**
     * Generate QR code for TOTP setup
     */
    async generateQRCode(secret, userId) {
        const issuer = 'CampuSysV2';
        const accountName = `${userId}@campusys.edu`;
        const otpAuthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
        
        // In a real implementation, you would use a QR code library
        return {
            url: otpAuthUrl,
            dataUrl: `data:image/svg+xml,${encodeURIComponent(this.generateQRCodeSVG(otpAuthUrl))}`,
            secret: secret,
            manualEntryKey: secret.match(/.{1,4}/g).join(' ')
        };
    }

    /**
     * Generate simple QR code SVG (placeholder implementation)
     */
    generateQRCodeSVG(data) {
        return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="white"/>
            <rect x="10" y="10" width="20" height="20" fill="black"/>
            <rect x="40" y="10" width="20" height="20" fill="black"/>
            <rect x="70" y="10" width="20" height="20" fill="black"/>
            <rect x="10" y="40" width="20" height="20" fill="black"/>
            <rect x="70" y="40" width="20" height="20" fill="black"/>
            <text x="100" y="100" font-family="Arial" font-size="12" fill="black">QR Code</text>
            <text x="100" y="120" font-family="Arial" font-size="10" fill="gray">Scan with authenticator app</text>
        </svg>`;
    }

    /**
     * Generate backup codes
     */
    generateBackupCodes(userId, count = 10) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            const code = Math.random().toString(36).substr(2, 8).toUpperCase();
            codes.push(code);
        }
        
        this.backupCodes.set(userId, {
            codes: codes.map(code => ({ code, used: false, usedAt: null })),
            generatedAt: new Date()
        });
        
        return codes;
    }

    /**
     * Verify 2FA code
     */
    async verify2FACode(userId, code, method = 'totp') {
        const maxAttempts = 5;
        const timeWindow = 15 * 60 * 1000; // 15 minutes
        
        // Check rate limiting
        const attempts = this.verificationAttempts.get(userId) || { count: 0, lastAttempt: 0 };
        const now = Date.now();
        
        if (attempts.count >= maxAttempts && (now - attempts.lastAttempt) < timeWindow) {
            return {
                success: false,
                error: 'Too many verification attempts. Please try again later.',
                lockoutTime: Math.ceil((timeWindow - (now - attempts.lastAttempt)) / 1000 / 60)
            };
        }
        
        // Reset attempts if window expired
        if ((now - attempts.lastAttempt) >= timeWindow) {
            attempts.count = 0;
        }
        
        let verificationResult = false;
        
        try {
            switch (method) {
                case 'totp':
                    verificationResult = await this.verifyTOTP(userId, code);
                    break;
                case 'sms':
                    verificationResult = await this.verifySMS(userId, code);
                    break;
                case 'email':
                    verificationResult = await this.verifyEmail(userId, code);
                    break;
                case 'backup':
                    verificationResult = await this.verifyBackupCode(userId, code);
                    break;
                default:
                    throw new Error('Unsupported verification method');
            }
            
            if (verificationResult) {
                // Reset attempts on successful verification
                this.verificationAttempts.delete(userId);
                
                // Log successful verification
                securityManager.logSecurityEvent('2fa_verification_success', {
                    userId: userId,
                    method: method,
                    timestamp: new Date()
                });
                
                return {
                    success: true,
                    method: method,
                    timestamp: new Date()
                };
            } else {
                // Increment failed attempts
                attempts.count += 1;
                attempts.lastAttempt = now;
                this.verificationAttempts.set(userId, attempts);
                
                // Log failed verification
                securityManager.logSecurityEvent('2fa_verification_failed', {
                    userId: userId,
                    method: method,
                    attemptsRemaining: maxAttempts - attempts.count,
                    timestamp: new Date()
                });
                
                return {
                    success: false,
                    error: 'Invalid verification code',
                    attemptsRemaining: maxAttempts - attempts.count
                };
            }
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verify TOTP code
     */
    async verifyTOTP(userId, code) {
        const userSecret = this.totpSecrets.get(userId);
        if (!userSecret) {
            throw new Error('TOTP not configured for this user');
        }
        
        // Simplified TOTP verification (in production, use a proper TOTP library)
        const timeStep = Math.floor(Date.now() / 1000 / 30);
        const validCodes = [
            this.generateTOTPCode(userSecret, timeStep - 1), // Previous time step
            this.generateTOTPCode(userSecret, timeStep),     // Current time step
            this.generateTOTPCode(userSecret, timeStep + 1)  // Next time step
        ];
        
        return validCodes.includes(code);
    }

    /**
     * Generate TOTP code (simplified implementation)
     */
    generateTOTPCode(secret, timeStep) {
        // This is a simplified implementation
        // In production, use RFC 6238 compliant TOTP algorithm
        const hash = this.simpleHash(secret + timeStep.toString());
        return (parseInt(hash.substr(-6), 16) % 1000000).toString().padStart(6, '0');
    }

    /**
     * Simple hash function (for demonstration only)
     */
    simpleHash(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Verify SMS code
     */
    async verifySMS(userId, code) {
        const smsData = this.smsVerification.get(userId);
        if (!smsData) {
            throw new Error('SMS verification not initiated');
        }
        
        const now = Date.now();
        const codeAge = now - smsData.sentAt;
        const maxAge = 5 * 60 * 1000; // 5 minutes
        
        if (codeAge > maxAge) {
            this.smsVerification.delete(userId);
            throw new Error('SMS code has expired');
        }
        
        return smsData.code === code;
    }

    /**
     * Verify email code
     */
    async verifyEmail(userId, code) {
        // Similar to SMS verification
        return this.verifySMS(userId, code); // Simplified for demo
    }

    /**
     * Verify backup code
     */
    async verifyBackupCode(userId, code) {
        const backupData = this.backupCodes.get(userId);
        if (!backupData) {
            throw new Error('No backup codes available');
        }
        
        const codeEntry = backupData.codes.find(c => c.code === code && !c.used);
        if (codeEntry) {
            codeEntry.used = true;
            codeEntry.usedAt = new Date();
            
            // Check if running low on backup codes
            const remainingCodes = backupData.codes.filter(c => !c.used).length;
            if (remainingCodes <= 2) {
                this.notifyLowBackupCodes(userId, remainingCodes);
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * Send SMS verification code
     */
    async sendSMSCode(userId, phoneNumber) {
        const code = Math.random().toString().substr(2, 6);
        
        this.smsVerification.set(userId, {
            code: code,
            phoneNumber: phoneNumber,
            sentAt: Date.now()
        });
        
        // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
        console.log(`SMS Code for ${phoneNumber}: ${code}`);
        
        return {
            success: true,
            message: 'Verification code sent to your phone',
            expiresIn: 300 // 5 minutes
        };
    }

    /**
     * Send email verification code
     */
    async sendEmailCode(userId, email) {
        const code = Math.random().toString().substr(2, 6);
        
        // Similar to SMS implementation
        this.smsVerification.set(userId, {
            code: code,
            email: email,
            sentAt: Date.now()
        });
        
        console.log(`Email Code for ${email}: ${code}`);
        
        return {
            success: true,
            message: 'Verification code sent to your email',
            expiresIn: 300
        };
    }

    /**
     * Add trusted device
     */
    addTrustedDevice(userId, deviceInfo) {
        const deviceId = this.generateDeviceId(deviceInfo);
        const trustedDevice = {
            id: deviceId,
            name: deviceInfo.name || 'Unknown Device',
            userAgent: deviceInfo.userAgent,
            ipAddress: deviceInfo.ipAddress,
            addedAt: new Date(),
            lastUsed: new Date(),
            trusted: true
        };
        
        if (!this.trustedDevices.has(userId)) {
            this.trustedDevices.set(userId, []);
        }
        
        this.trustedDevices.get(userId).push(trustedDevice);
        
        return deviceId;
    }

    /**
     * Check if device is trusted
     */
    isDeviceTrusted(userId, deviceInfo) {
        const userDevices = this.trustedDevices.get(userId) || [];
        const deviceId = this.generateDeviceId(deviceInfo);
        
        return userDevices.some(device => 
            device.id === deviceId && 
            device.trusted &&
            (Date.now() - device.lastUsed) < (30 * 24 * 60 * 60 * 1000) // 30 days
        );
    }

    /**
     * Generate device ID
     */
    generateDeviceId(deviceInfo) {
        const fingerprint = [
            deviceInfo.userAgent,
            deviceInfo.language,
            deviceInfo.platform,
            deviceInfo.screenResolution
        ].join('|');
        
        return this.simpleHash(fingerprint);
    }

    /**
     * Get 2FA setup instructions
     */
    get2FAInstructions(method) {
        const instructions = {
            totp: [
                'Download an authenticator app (Google Authenticator, Authy, etc.)',
                'Scan the QR code with your authenticator app',
                'Enter the 6-digit code from your app to complete setup',
                'Save your backup codes in a secure location'
            ],
            sms: [
                'Verify your phone number',
                'You will receive verification codes via SMS',
                'Enter the code when prompted during login',
                'Save your backup codes in a secure location'
            ],
            email: [
                'Verify your email address',
                'You will receive verification codes via email',
                'Enter the code when prompted during login',
                'Save your backup codes in a secure location'
            ]
        };
        
        return instructions[method] || [];
    }

    /**
     * Disable 2FA
     */
    async disable2FA(userId, verificationCode, method = 'totp') {
        // Verify current 2FA before disabling
        const verification = await this.verify2FACode(userId, verificationCode, method);
        
        if (!verification.success) {
            return {
                success: false,
                error: 'Invalid verification code. Cannot disable 2FA.'
            };
        }
        
        // Remove 2FA data
        this.totpSecrets.delete(userId);
        this.backupCodes.delete(userId);
        this.smsVerification.delete(userId);
        this.trustedDevices.delete(userId);
        
        // Log security event
        securityManager.logSecurityEvent('2fa_disabled', {
            userId: userId,
            timestamp: new Date()
        });
        
        return {
            success: true,
            message: '2FA has been disabled for your account'
        };
    }

    /**
     * Get user's 2FA status
     */
    get2FAStatus(userId) {
        return {
            enabled: this.totpSecrets.has(userId),
            methods: this.getEnabled2FAMethods(userId),
            backupCodesCount: this.getRemainingBackupCodes(userId),
            trustedDevicesCount: (this.trustedDevices.get(userId) || []).length,
            lastVerification: this.getLastVerification(userId)
        };
    }

    /**
     * Get enabled 2FA methods for user
     */
    getEnabled2FAMethods(userId) {
        const methods = [];
        
        if (this.totpSecrets.has(userId)) {
            methods.push('totp');
        }
        
        // Check other methods...
        
        return methods;
    }

    /**
     * Get remaining backup codes count
     */
    getRemainingBackupCodes(userId) {
        const backupData = this.backupCodes.get(userId);
        if (!backupData) return 0;
        
        return backupData.codes.filter(c => !c.used).length;
    }

    /**
     * Get last verification timestamp
     */
    getLastVerification(userId) {
        // This would be stored in a real database
        return new Date(); // Placeholder
    }

    /**
     * Notify user of low backup codes
     */
    notifyLowBackupCodes(userId, remaining) {
        const notification = {
            type: 'security_warning',
            title: 'Low Backup Codes',
            message: `You have only ${remaining} backup codes remaining. Generate new ones soon.`,
            userId: userId,
            timestamp: new Date()
        };
        
        // Send notification (email, push, etc.)
        console.log('Low backup codes notification:', notification);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for 2FA enable requests
        document.addEventListener('enable-2fa', async (e) => {
            const { userId, method, callback } = e.detail;
            const result = await this.enable2FA(userId, method);
            callback(result);
        });
        
        // Listen for 2FA verification requests
        document.addEventListener('verify-2fa', async (e) => {
            const { userId, code, method, callback } = e.detail;
            const result = await this.verify2FACode(userId, code, method);
            callback(result);
        });
    }

    /**
     * Load user preferences
     */
    loadUserPreferences() {
        // Load from localStorage or API
        const preferences = localStorage.getItem('2fa_preferences');
        if (preferences) {
            try {
                const parsed = JSON.parse(preferences);
                // Apply preferences
            } catch (error) {
                console.error('Error loading 2FA preferences:', error);
            }
        }
    }

    /**
     * Save user preferences
     */
    saveUserPreferences(userId, preferences) {
        localStorage.setItem('2fa_preferences', JSON.stringify({
            userId: userId,
            preferences: preferences,
            updatedAt: new Date()
        }));
    }
}

// Initialize 2FA system
const twoFactorAuth = new TwoFactorAuth();

// Export for global access
window.TwoFactorAuth = TwoFactorAuth;
window.twoFactorAuth = twoFactorAuth;