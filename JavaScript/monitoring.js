/**
 * Advanced Monitoring and Alerting System for CampuSysV2
 * Provides comprehensive system monitoring, performance tracking, and intelligent alerting
 */

class MonitoringSystem {
    constructor() {
        this.metrics = new Map();
        this.alerts = [];
        this.thresholds = new Map();
        this.healthChecks = new Map();
        this.performanceData = [];
        this.errorTracking = [];
        this.userBehavior = [];
        this.init();
    }

    init() {
        this.setupMetrics();
        this.setupThresholds();
        this.setupHealthChecks();
        this.startMonitoring();
        this.setupEventListeners();
    }

    /**
     * Setup system metrics tracking
     */
    setupMetrics() {
        const metrics = [
            { id: 'response_time', name: 'Average Response Time', unit: 'ms', category: 'performance' },
            { id: 'error_rate', name: 'Error Rate', unit: '%', category: 'reliability' },
            { id: 'cpu_usage', name: 'CPU Usage', unit: '%', category: 'system' },
            { id: 'memory_usage', name: 'Memory Usage', unit: '%', category: 'system' },
            { id: 'active_users', name: 'Active Users', unit: 'count', category: 'usage' },
            { id: 'api_requests', name: 'API Requests', unit: 'req/min', category: 'api' },
            { id: 'cache_hit_rate', name: 'Cache Hit Rate', unit: '%', category: 'performance' },
            { id: 'database_connections', name: 'Database Connections', unit: 'count', category: 'database' },
            { id: 'workflow_success_rate', name: 'Workflow Success Rate', unit: '%', category: 'business' },
            { id: 'security_incidents', name: 'Security Incidents', unit: 'count/hour', category: 'security' }
        ];

        metrics.forEach(metric => {
            this.metrics.set(metric.id, {
                ...metric,
                currentValue: 0,
                history: [],
                lastUpdated: new Date(),
                status: 'healthy'
            });
        });
    }

    /**
     * Setup alert thresholds
     */
    setupThresholds() {
        const thresholds = [
            { metric: 'response_time', warning: 500, critical: 1000 },
            { metric: 'error_rate', warning: 2, critical: 5 },
            { metric: 'cpu_usage', warning: 70, critical: 85 },
            { metric: 'memory_usage', warning: 75, critical: 90 },
            { metric: 'cache_hit_rate', warning: 80, critical: 70, inverted: true },
            { metric: 'workflow_success_rate', warning: 95, critical: 90, inverted: true },
            { metric: 'security_incidents', warning: 1, critical: 3 }
        ];

        thresholds.forEach(threshold => {
            this.thresholds.set(threshold.metric, threshold);
        });
    }

    /**
     * Setup health checks
     */
    setupHealthChecks() {
        const healthChecks = [
            {
                id: 'api_health',
                name: 'API Endpoints Health',
                check: () => this.checkAPIHealth(),
                interval: 60000, // 1 minute
                critical: true
            },
            {
                id: 'database_health',
                name: 'Database Connectivity',
                check: () => this.checkDatabaseHealth(),
                interval: 30000, // 30 seconds
                critical: true
            },
            {
                id: 'cache_health',
                name: 'Cache System Health',
                check: () => this.checkCacheHealth(),
                interval: 120000, // 2 minutes
                critical: false
            },
            {
                id: 'security_health',
                name: 'Security System Health',
                check: () => this.checkSecurityHealth(),
                interval: 300000, // 5 minutes
                critical: true
            },
            {
                id: 'workflow_health',
                name: 'Workflow Engine Health',
                check: () => this.checkWorkflowHealth(),
                interval: 180000, // 3 minutes
                critical: false
            }
        ];

        healthChecks.forEach(check => {
            this.healthChecks.set(check.id, {
                ...check,
                lastCheck: null,
                status: 'unknown',
                lastError: null,
                consecutiveFailures: 0
            });
        });
    }

    /**
     * Start monitoring system
     */
    startMonitoring() {
        // Start metric collection
        setInterval(() => {
            this.collectMetrics();
        }, 10000); // Collect every 10 seconds

        // Start health checks
        this.healthChecks.forEach((check, id) => {
            this.runHealthCheck(id);
            setInterval(() => {
                this.runHealthCheck(id);
            }, check.interval);
        });

        // Start anomaly detection
        setInterval(() => {
            this.detectAnomalies();
        }, 60000); // Check every minute

        // Clean old data
        setInterval(() => {
            this.cleanupOldData();
        }, 3600000); // Clean every hour
    }

    /**
     * Collect system metrics
     */
    async collectMetrics() {
        try {
            // Response time metric
            const responseTime = await this.measureResponseTime();
            this.updateMetric('response_time', responseTime);

            // Error rate metric
            const errorRate = this.calculateErrorRate();
            this.updateMetric('error_rate', errorRate);

            // CPU usage (simulated)
            const cpuUsage = this.getCPUUsage();
            this.updateMetric('cpu_usage', cpuUsage);

            // Memory usage (simulated)
            const memoryUsage = this.getMemoryUsage();
            this.updateMetric('memory_usage', memoryUsage);

            // Active users
            const activeUsers = this.getActiveUsers();
            this.updateMetric('active_users', activeUsers);

            // API requests per minute
            const apiRequests = this.getAPIRequestRate();
            this.updateMetric('api_requests', apiRequests);

            // Cache hit rate
            const cacheHitRate = this.getCacheHitRate();
            this.updateMetric('cache_hit_rate', cacheHitRate);

            // Workflow success rate
            const workflowSuccessRate = this.getWorkflowSuccessRate();
            this.updateMetric('workflow_success_rate', workflowSuccessRate);

            // Security incidents
            const securityIncidents = this.getSecurityIncidents();
            this.updateMetric('security_incidents', securityIncidents);

        } catch (error) {
            console.error('Error collecting metrics:', error);
            this.createAlert('system', 'error', 'Failed to collect system metrics', { error: error.message });
        }
    }

    /**
     * Update a metric value
     */
    updateMetric(metricId, value) {
        const metric = this.metrics.get(metricId);
        if (!metric) return;

        const previousValue = metric.currentValue;
        metric.currentValue = value;
        metric.lastUpdated = new Date();
        
        // Add to history (keep last 100 values)
        metric.history.push({
            value: value,
            timestamp: new Date()
        });
        
        if (metric.history.length > 100) {
            metric.history.shift();
        }

        // Check thresholds
        this.checkThresholds(metricId, value, previousValue);
    }

    /**
     * Check metric thresholds and create alerts
     */
    checkThresholds(metricId, currentValue, previousValue) {
        const threshold = this.thresholds.get(metricId);
        const metric = this.metrics.get(metricId);
        
        if (!threshold || !metric) return;

        let status = 'healthy';
        let alertLevel = null;

        if (threshold.inverted) {
            // For metrics where lower is better (e.g., cache hit rate)
            if (currentValue <= threshold.critical) {
                status = 'critical';
                alertLevel = 'critical';
            } else if (currentValue <= threshold.warning) {
                status = 'warning';
                alertLevel = 'warning';
            }
        } else {
            // For metrics where higher is worse (e.g., response time, error rate)
            if (currentValue >= threshold.critical) {
                status = 'critical';
                alertLevel = 'critical';
            } else if (currentValue >= threshold.warning) {
                status = 'warning';
                alertLevel = 'warning';
            }
        }

        // Update metric status
        const previousStatus = metric.status;
        metric.status = status;

        // Create alert if status changed or critical threshold exceeded
        if (alertLevel && (previousStatus !== status || alertLevel === 'critical')) {
            this.createAlert('threshold', alertLevel, 
                `${metric.name} ${alertLevel} threshold exceeded`, {
                    metric: metricId,
                    currentValue: currentValue,
                    threshold: alertLevel === 'critical' ? threshold.critical : threshold.warning,
                    previousValue: previousValue
                }
            );
        }

        // Create recovery alert if status improved
        if (previousStatus !== 'healthy' && status === 'healthy') {
            this.createAlert('recovery', 'info', 
                `${metric.name} has recovered to healthy status`, {
                    metric: metricId,
                    currentValue: currentValue,
                    previousStatus: previousStatus
                }
            );
        }
    }

    /**
     * Run individual health check
     */
    async runHealthCheck(checkId) {
        const check = this.healthChecks.get(checkId);
        if (!check) return;

        try {
            const result = await check.check();
            const previousStatus = check.status;
            
            check.lastCheck = new Date();
            check.status = result.healthy ? 'healthy' : 'unhealthy';
            check.lastError = result.error || null;
            
            if (result.healthy) {
                check.consecutiveFailures = 0;
                
                // Recovery alert
                if (previousStatus === 'unhealthy') {
                    this.createAlert('recovery', 'info', 
                        `${check.name} health check recovered`, {
                            checkId: checkId,
                            details: result.details
                        }
                    );
                }
            } else {
                check.consecutiveFailures++;
                
                // Create alert for failure
                const alertLevel = check.critical ? 'critical' : 'warning';
                this.createAlert('health_check', alertLevel, 
                    `${check.name} health check failed`, {
                        checkId: checkId,
                        error: result.error,
                        consecutiveFailures: check.consecutiveFailures,
                        details: result.details
                    }
                );
            }
            
        } catch (error) {
            check.lastCheck = new Date();
            check.status = 'error';
            check.lastError = error.message;
            check.consecutiveFailures++;
            
            this.createAlert('health_check', 'error', 
                `Health check ${check.name} threw an exception`, {
                    checkId: checkId,
                    error: error.message,
                    consecutiveFailures: check.consecutiveFailures
                }
            );
        }
    }

    /**
     * Create system alert
     */
    createAlert(type, level, message, details = {}) {
        const alert = {
            id: this.generateId('alert'),
            type: type,
            level: level,
            message: message,
            details: details,
            timestamp: new Date(),
            acknowledged: false,
            resolved: false,
            resolvedAt: null,
            acknowledgedBy: null,
            acknowledgedAt: null
        };

        this.alerts.push(alert);

        // Keep only last 1000 alerts
        if (this.alerts.length > 1000) {
            this.alerts.shift();
        }

        // Send immediate notification for critical alerts
        if (level === 'critical') {
            this.sendImmediateNotification(alert);
        }

        // Log to security manager
        if (window.securityManager) {
            securityManager.logSecurityEvent('monitoring_alert', {
                alertId: alert.id,
                type: type,
                level: level,
                message: message
            });
        }

        console.log(`[MONITOR] ${level.toUpperCase()}: ${message}`, details);
    }

    /**
     * Send immediate notification for critical alerts
     */
    sendImmediateNotification(alert) {
        // In production, this would integrate with notification services
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`CampuSysV2 Alert: ${alert.level.toUpperCase()}`, {
                body: alert.message,
                icon: '/images/icon-192x192.png',
                tag: alert.id,
                requireInteraction: true
            });
        }

        // Also show in-app notification
        if (window.Swal) {
            Swal.fire({
                icon: alert.level === 'critical' ? 'error' : 'warning',
                title: `System Alert: ${alert.level.toUpperCase()}`,
                text: alert.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: alert.level === 'critical' ? 0 : 5000
            });
        }
    }

    /**
     * Health check implementations
     */
    async checkAPIHealth() {
        try {
            const startTime = Date.now();
            
            // Test critical API endpoints
            const endpoints = ['/api/v1/health', '/api/v1/auth/status'];
            const results = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, { 
                        method: 'GET',
                        timeout: 5000 
                    });
                    
                    results.push({
                        endpoint: endpoint,
                        status: response.status,
                        responseTime: Date.now() - startTime,
                        healthy: response.ok
                    });
                } catch (error) {
                    results.push({
                        endpoint: endpoint,
                        error: error.message,
                        healthy: false
                    });
                }
            }
            
            const healthyEndpoints = results.filter(r => r.healthy).length;
            const totalEndpoints = results.length;
            
            return {
                healthy: healthyEndpoints === totalEndpoints,
                details: {
                    healthyEndpoints: healthyEndpoints,
                    totalEndpoints: totalEndpoints,
                    results: results
                },
                error: healthyEndpoints < totalEndpoints ? 'Some API endpoints are unhealthy' : null
            };
            
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                details: { error: 'API health check failed' }
            };
        }
    }

    async checkDatabaseHealth() {
        try {
            // Simulate database health check
            const isHealthy = Math.random() > 0.05; // 95% healthy
            const responseTime = Math.random() * 100 + 10; // 10-110ms
            
            return {
                healthy: isHealthy,
                details: {
                    responseTime: responseTime,
                    connections: Math.floor(Math.random() * 50) + 10
                },
                error: isHealthy ? null : 'Database connection timeout'
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                details: { error: 'Database health check failed' }
            };
        }
    }

    async checkCacheHealth() {
        try {
            // Check if service worker cache is working
            if ('serviceWorker' in navigator && 'caches' in window) {
                const cacheNames = await caches.keys();
                const hasCache = cacheNames.length > 0;
                
                if (hasCache) {
                    const cache = await caches.open(cacheNames[0]);
                    const keys = await cache.keys();
                    
                    return {
                        healthy: true,
                        details: {
                            cacheCount: cacheNames.length,
                            cachedItems: keys.length
                        }
                    };
                }
            }
            
            return {
                healthy: false,
                error: 'Cache system not available',
                details: { error: 'No cache found' }
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                details: { error: 'Cache health check failed' }
            };
        }
    }

    async checkSecurityHealth() {
        try {
            const securityChecks = [];
            
            // Check if security manager is active
            if (window.securityManager) {
                securityChecks.push({ name: 'Security Manager', healthy: true });
            } else {
                securityChecks.push({ name: 'Security Manager', healthy: false });
            }
            
            // Check CSP headers
            const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            securityChecks.push({ 
                name: 'Content Security Policy', 
                healthy: !!cspMeta 
            });
            
            // Check HTTPS
            securityChecks.push({ 
                name: 'HTTPS', 
                healthy: location.protocol === 'https:' 
            });
            
            const healthyChecks = securityChecks.filter(c => c.healthy).length;
            
            return {
                healthy: healthyChecks === securityChecks.length,
                details: {
                    checks: securityChecks,
                    score: Math.round((healthyChecks / securityChecks.length) * 100)
                },
                error: healthyChecks < securityChecks.length ? 'Some security checks failed' : null
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                details: { error: 'Security health check failed' }
            };
        }
    }

    async checkWorkflowHealth() {
        try {
            // Check if workflow engine is active
            const workflowEngine = window.workflowEngine;
            
            if (!workflowEngine) {
                return {
                    healthy: false,
                    error: 'Workflow engine not initialized',
                    details: { error: 'No workflow engine found' }
                };
            }
            
            // Get workflow statistics
            const stats = workflowEngine.getWorkflowStats();
            const successRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 100;
            
            return {
                healthy: successRate >= 90,
                details: {
                    totalWorkflows: stats.total,
                    completedWorkflows: stats.completed,
                    successRate: successRate,
                    runningWorkflows: stats.running
                },
                error: successRate < 90 ? `Workflow success rate is ${successRate.toFixed(1)}%` : null
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                details: { error: 'Workflow health check failed' }
            };
        }
    }

    /**
     * Metric calculation methods
     */
    async measureResponseTime() {
        const startTime = performance.now();
        try {
            await fetch('/api/v1/ping', { method: 'GET' });
            return performance.now() - startTime;
        } catch {
            return 1000; // Return high value if request fails
        }
    }

    calculateErrorRate() {
        const recentErrors = this.errorTracking.filter(
            error => (Date.now() - error.timestamp) < 300000 // Last 5 minutes
        );
        const totalRequests = Math.max(100, Math.random() * 1000); // Simulated
        return (recentErrors.length / totalRequests) * 100;
    }

    getCPUUsage() {
        // Simulate CPU usage based on time and random variation
        const baseUsage = 30 + Math.sin(Date.now() / 100000) * 20;
        return Math.max(0, Math.min(100, baseUsage + Math.random() * 20));
    }

    getMemoryUsage() {
        // Simulate memory usage
        if ('memory' in performance) {
            const mem = performance.memory;
            return (mem.usedJSHeapSize / mem.totalJSHeapSize) * 100;
        }
        return Math.random() * 30 + 40; // 40-70%
    }

    getActiveUsers() {
        // In production, this would come from session tracking
        return Math.floor(Math.random() * 100) + 50;
    }

    getAPIRequestRate() {
        // Simulate API request rate
        return Math.floor(Math.random() * 500) + 100;
    }

    getCacheHitRate() {
        // Simulate cache hit rate
        return Math.random() * 20 + 75; // 75-95%
    }

    getWorkflowSuccessRate() {
        // Get from workflow engine if available
        if (window.workflowEngine) {
            const stats = window.workflowEngine.getWorkflowStats();
            return stats.total > 0 ? (stats.completed / stats.total) * 100 : 100;
        }
        return Math.random() * 10 + 90; // 90-100%
    }

    getSecurityIncidents() {
        // Count recent security incidents
        if (window.securityManager) {
            // This would be implemented in the security manager
            return Math.random() < 0.1 ? 1 : 0; // 10% chance of incident
        }
        return 0;
    }

    /**
     * Anomaly detection
     */
    detectAnomalies() {
        this.metrics.forEach((metric, metricId) => {
            if (metric.history.length < 10) return; // Need enough data
            
            const recentValues = metric.history.slice(-10).map(h => h.value);
            const average = recentValues.reduce((a, b) => a + b) / recentValues.length;
            const stdDev = Math.sqrt(
                recentValues.reduce((sq, n) => sq + Math.pow(n - average, 2), 0) / recentValues.length
            );
            
            const currentValue = metric.currentValue;
            const zScore = Math.abs((currentValue - average) / stdDev);
            
            // Alert if value is more than 3 standard deviations from average
            if (zScore > 3) {
                this.createAlert('anomaly', 'warning', 
                    `Anomaly detected in ${metric.name}`, {
                        metric: metricId,
                        currentValue: currentValue,
                        average: average,
                        standardDeviation: stdDev,
                        zScore: zScore
                    }
                );
            }
        });
    }

    /**
     * Cleanup old data
     */
    cleanupOldData() {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        // Clean performance data
        this.performanceData = this.performanceData.filter(
            data => data.timestamp > oneHourAgo
        );
        
        // Clean error tracking
        this.errorTracking = this.errorTracking.filter(
            error => error.timestamp > oneHourAgo
        );
        
        // Clean old metric history
        this.metrics.forEach(metric => {
            metric.history = metric.history.filter(
                entry => entry.timestamp.getTime() > oneHourAgo
            );
        });
    }

    /**
     * Get system status dashboard
     */
    getSystemStatus() {
        const overallHealth = this.calculateOverallHealth();
        const recentAlerts = this.alerts.filter(
            alert => (Date.now() - alert.timestamp.getTime()) < 3600000 // Last hour
        );
        
        return {
            overallHealth: overallHealth,
            metrics: this.getMetricsSummary(),
            healthChecks: this.getHealthChecksSummary(),
            recentAlerts: recentAlerts.slice(-10), // Last 10 alerts
            alertCounts: {
                critical: recentAlerts.filter(a => a.level === 'critical').length,
                warning: recentAlerts.filter(a => a.level === 'warning').length,
                info: recentAlerts.filter(a => a.level === 'info').length
            },
            uptime: this.calculateUptime(),
            lastUpdated: new Date()
        };
    }

    calculateOverallHealth() {
        const healthyMetrics = Array.from(this.metrics.values()).filter(
            m => m.status === 'healthy'
        ).length;
        const totalMetrics = this.metrics.size;
        
        const healthyChecks = Array.from(this.healthChecks.values()).filter(
            c => c.status === 'healthy'
        ).length;
        const totalChecks = this.healthChecks.size;
        
        const metricHealth = totalMetrics > 0 ? (healthyMetrics / totalMetrics) * 100 : 100;
        const checkHealth = totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 100;
        
        return Math.round((metricHealth + checkHealth) / 2);
    }

    getMetricsSummary() {
        const summary = {};
        this.metrics.forEach((metric, id) => {
            summary[id] = {
                name: metric.name,
                value: metric.currentValue,
                unit: metric.unit,
                status: metric.status,
                lastUpdated: metric.lastUpdated
            };
        });
        return summary;
    }

    getHealthChecksSummary() {
        const summary = {};
        this.healthChecks.forEach((check, id) => {
            summary[id] = {
                name: check.name,
                status: check.status,
                lastCheck: check.lastCheck,
                consecutiveFailures: check.consecutiveFailures,
                critical: check.critical
            };
        });
        return summary;
    }

    calculateUptime() {
        // Simple uptime calculation based on critical alerts
        const criticalAlerts = this.alerts.filter(a => a.level === 'critical').length;
        const uptimePercentage = Math.max(99.0, 100 - (criticalAlerts * 0.1));
        
        return {
            percentage: uptimePercentage,
            duration: '30 days', // Would be calculated from actual start time
            lastIncident: criticalAlerts > 0 ? this.alerts.find(a => a.level === 'critical')?.timestamp : null
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for errors
        window.addEventListener('error', (event) => {
            this.trackError({
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });

        // Listen for unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                message: 'Unhandled Promise Rejection: ' + event.reason,
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });

        // Listen for performance entries
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.trackPerformance(entry);
                }
            });

            observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
        }
    }

    trackError(error) {
        this.errorTracking.push(error);
        
        // Create alert for critical errors
        if (error.message.includes('TypeError') || error.message.includes('ReferenceError')) {
            this.createAlert('error', 'critical', 'Critical JavaScript error detected', {
                error: error.message,
                filename: error.filename,
                line: error.line
            });
        }
    }

    trackPerformance(entry) {
        this.performanceData.push({
            name: entry.name,
            type: entry.entryType,
            startTime: entry.startTime,
            duration: entry.duration,
            timestamp: Date.now()
        });
    }

    /**
     * Generate unique ID
     */
    generateId(prefix = 'mon') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
}

// Initialize monitoring system
const monitoringSystem = new MonitoringSystem();

// Export for global access
window.MonitoringSystem = MonitoringSystem;
window.monitoringSystem = monitoringSystem;