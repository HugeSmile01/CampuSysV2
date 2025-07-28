/**
 * Advanced Analytics Dashboard for CampuSysV2
 * Provides real-time insights, predictive analytics, and AI-powered recommendations
 */

class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.realTimeData = {};
        this.predictions = {};
        this.notifications = [];
        this.init();
    }

    init() {
        this.setupRealTimeMonitoring();
        this.loadInitialData();
        this.setupEventListeners();
    }

    /**
     * Generate sample analytics data for demonstration
     */
    generateSampleData() {
        const currentTime = new Date();
        const timeRange = [];
        const userActivity = [];
        const systemLoad = [];
        const courseEngagement = [];

        // Generate 24 hours of sample data
        for (let i = 23; i >= 0; i--) {
            const time = new Date(currentTime.getTime() - (i * 60 * 60 * 1000));
            timeRange.push(time.getHours() + ':00');
            
            // Simulate realistic patterns
            userActivity.push(Math.floor(Math.random() * 200) + (20 - i) * 5);
            systemLoad.push(Math.random() * 100);
            courseEngagement.push(Math.floor(Math.random() * 150) + 50);
        }

        return {
            timeRange,
            userActivity,
            systemLoad,
            courseEngagement,
            totalUsers: 1247,
            activeUsers: 384,
            completedTasks: 1867,
            pendingTasks: 234,
            systemUptime: 99.7,
            avgResponseTime: 0.245
        };
    }

    /**
     * Create performance metrics cards
     */
    createMetricsCards() {
        const data = this.generateSampleData();
        
        const metricsHTML = `
            <div class="metrics-grid">
                <div class="metric-card primary">
                    <div class="metric-icon">
                        <i class="material-icons">people</i>
                    </div>
                    <div class="metric-content">
                        <h3>${data.totalUsers.toLocaleString()}</h3>
                        <p>Total Users</p>
                        <span class="metric-change positive">+12% from last month</span>
                    </div>
                </div>
                
                <div class="metric-card success">
                    <div class="metric-icon">
                        <i class="material-icons">trending_up</i>
                    </div>
                    <div class="metric-content">
                        <h3>${data.activeUsers}</h3>
                        <p>Active Users</p>
                        <span class="metric-change positive">+8% from yesterday</span>
                    </div>
                </div>
                
                <div class="metric-card warning">
                    <div class="metric-icon">
                        <i class="material-icons">assignment_turned_in</i>
                    </div>
                    <div class="metric-content">
                        <h3>${data.completedTasks.toLocaleString()}</h3>
                        <p>Completed Tasks</p>
                        <span class="metric-change positive">+15% from last week</span>
                    </div>
                </div>
                
                <div class="metric-card info">
                    <div class="metric-icon">
                        <i class="material-icons">speed</i>
                    </div>
                    <div class="metric-content">
                        <h3>${data.systemUptime}%</h3>
                        <p>System Uptime</p>
                        <span class="metric-change neutral">Last 30 days</span>
                    </div>
                </div>
            </div>
        `;
        
        return metricsHTML;
    }

    /**
     * Create advanced charts with Chart.js
     */
    createAdvancedCharts() {
        const data = this.generateSampleData();
        
        // User Activity Chart
        const userActivityCtx = document.getElementById('userActivityChart');
        if (userActivityCtx) {
            this.charts.userActivity = new Chart(userActivityCtx, {
                type: 'line',
                data: {
                    labels: data.timeRange,
                    datasets: [{
                        label: 'Active Users',
                        data: data.userActivity,
                        borderColor: '#00BCD4',
                        backgroundColor: 'rgba(0, 188, 212, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'User Activity (24 Hours)'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // System Performance Chart
        const systemPerfCtx = document.getElementById('systemPerformanceChart');
        if (systemPerfCtx) {
            this.charts.systemPerformance = new Chart(systemPerfCtx, {
                type: 'doughnut',
                data: {
                    labels: ['CPU Usage', 'Memory Usage', 'Storage Usage', 'Available'],
                    datasets: [{
                        data: [35, 45, 25, 65],
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'System Resource Usage'
                        }
                    }
                }
            });
        }

        // Course Engagement Chart
        const courseEngagementCtx = document.getElementById('courseEngagementChart');
        if (courseEngagementCtx) {
            this.charts.courseEngagement = new Chart(courseEngagementCtx, {
                type: 'bar',
                data: {
                    labels: ['Math', 'Science', 'Literature', 'History', 'Art', 'PE'],
                    datasets: [{
                        label: 'Engagement Score',
                        data: [85, 92, 78, 70, 88, 75],
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Course Engagement Levels'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }

    /**
     * Generate AI-powered insights and recommendations
     */
    generateAIInsights() {
        const insights = [
            {
                type: 'optimization',
                title: 'Peak Usage Optimization',
                message: 'System usage peaks at 2 PM. Consider load balancing during this time.',
                priority: 'high',
                icon: 'timeline'
            },
            {
                type: 'prediction',
                title: 'User Growth Prediction',
                message: 'Based on current trends, expect 15% user growth next month.',
                priority: 'medium',
                icon: 'trending_up'
            },
            {
                type: 'alert',
                title: 'Low Engagement Alert',
                message: 'History course engagement is 22% below average. Recommend review.',
                priority: 'high',
                icon: 'warning'
            },
            {
                type: 'suggestion',
                title: 'Resource Optimization',
                message: 'Memory usage can be reduced by 12% with cache optimization.',
                priority: 'low',
                icon: 'memory'
            }
        ];

        return insights;
    }

    /**
     * Create insights panel
     */
    createInsightsPanel() {
        const insights = this.generateAIInsights();
        
        let insightsHTML = '<div class="insights-panel"><h3>AI-Powered Insights</h3>';
        
        insights.forEach(insight => {
            insightsHTML += `
                <div class="insight-card ${insight.priority}">
                    <div class="insight-icon">
                        <i class="material-icons">${insight.icon}</i>
                    </div>
                    <div class="insight-content">
                        <h4>${insight.title}</h4>
                        <p>${insight.message}</p>
                        <span class="insight-type">${insight.type.toUpperCase()}</span>
                    </div>
                </div>
            `;
        });
        
        insightsHTML += '</div>';
        return insightsHTML;
    }

    /**
     * Real-time data monitoring
     */
    setupRealTimeMonitoring() {
        setInterval(() => {
            this.updateRealTimeMetrics();
        }, 5000); // Update every 5 seconds
    }

    updateRealTimeMetrics() {
        // Simulate real-time data updates
        const activeUsersElement = document.querySelector('.metric-card.success h3');
        if (activeUsersElement) {
            const currentUsers = parseInt(activeUsersElement.textContent);
            const variation = Math.floor(Math.random() * 20) - 10; // ±10 users
            const newUsers = Math.max(0, currentUsers + variation);
            activeUsersElement.textContent = newUsers;
        }

        // Update system uptime
        const uptimeElement = document.querySelector('.metric-card.info h3');
        if (uptimeElement) {
            const randomUptime = (99.5 + Math.random() * 0.5).toFixed(1);
            uptimeElement.textContent = randomUptime + '%';
        }
    }

    /**
     * Predictive analytics
     */
    generatePredictions() {
        return {
            userGrowth: {
                nextWeek: '+8%',
                nextMonth: '+15%',
                nextQuarter: '+42%'
            },
            systemLoad: {
                peakTime: '2:00 PM',
                lowTime: '5:00 AM',
                avgIncrease: '+12%'
            },
            courseCompletion: {
                math: '85%',
                science: '92%',
                literature: '78%'
            }
        };
    }

    /**
     * Export analytics data
     */
    exportData(format = 'csv') {
        const data = this.generateSampleData();
        
        if (format === 'csv') {
            let csv = 'Time,User Activity,System Load,Course Engagement\n';
            for (let i = 0; i < data.timeRange.length; i++) {
                csv += `${data.timeRange[i]},${data.userActivity[i]},${data.systemLoad[i]},${data.courseEngagement[i]}\n`;
            }
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'analytics_export.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Refresh button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'refreshAnalytics') {
                this.refreshDashboard();
            }
            
            if (e.target.id === 'exportAnalytics') {
                this.exportData('csv');
            }
        });
    }

    /**
     * Refresh dashboard data
     */
    refreshDashboard() {
        // Show loading indicator
        const metricsContainer = document.getElementById('analytics-metrics');
        if (metricsContainer) {
            metricsContainer.innerHTML = '<div class="loading-spinner"></div>';
            
            setTimeout(() => {
                this.loadInitialData();
            }, 1000);
        }
    }

    /**
     * Load initial dashboard data
     */
    loadInitialData() {
        const metricsContainer = document.getElementById('analytics-metrics');
        const chartsContainer = document.getElementById('analytics-charts');
        const insightsContainer = document.getElementById('analytics-insights');
        
        if (metricsContainer) {
            metricsContainer.innerHTML = this.createMetricsCards();
        }
        
        if (chartsContainer) {
            chartsContainer.innerHTML = `
                <div class="charts-grid">
                    <div class="chart-container">
                        <canvas id="userActivityChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="systemPerformanceChart"></canvas>
                    </div>
                    <div class="chart-container full-width">
                        <canvas id="courseEngagementChart"></canvas>
                    </div>
                </div>
            `;
            
            // Wait for elements to be in DOM before creating charts
            setTimeout(() => {
                this.createAdvancedCharts();
            }, 100);
        }
        
        if (insightsContainer) {
            insightsContainer.innerHTML = this.createInsightsPanel();
        }
    }
}

// Initialize analytics dashboard
let analyticsDashboard;

document.addEventListener('DOMContentLoaded', () => {
    // Check if Chart.js is available
    if (typeof Chart !== 'undefined') {
        analyticsDashboard = new AnalyticsDashboard();
    } else {
        // Load Chart.js if not available
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            analyticsDashboard = new AnalyticsDashboard();
        };
        document.head.appendChild(script);
    }
});

// Export for global access
window.AnalyticsDashboard = AnalyticsDashboard;