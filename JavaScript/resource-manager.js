/**
 * Smart Resource Management System for CampuSysV2
 * Automates resource allocation, scheduling, and optimization
 */

class ResourceManager {
    constructor() {
        this.resources = new Map();
        this.allocations = new Map();
        this.conflicts = [];
        this.optimizationQueue = [];
        this.analytics = {
            utilization: {},
            costs: {},
            efficiency: {}
        };
        this.init();
    }

    init() {
        this.loadResources();
        this.startOptimizationEngine();
        this.setupEventListeners();
    }

    /**
     * Load resource data
     */
    loadResources() {
        const resourceData = [
            // Classrooms
            {
                id: 'classroom_a101',
                name: 'Classroom A-101',
                type: 'classroom',
                category: 'lecture_hall',
                capacity: 50,
                features: ['projector', 'whiteboard', 'audio_system'],
                location: 'Building A, Floor 1',
                cost_per_hour: 25,
                availability: this.generateAvailability(),
                utilization_rate: 78,
                condition: 'excellent',
                maintenance_schedule: '2024-02-15'
            },
            {
                id: 'lab_b205',
                name: 'Computer Lab B-205',
                type: 'laboratory',
                category: 'computer_lab',
                capacity: 30,
                features: ['computers', 'network', 'printer', 'smartboard'],
                location: 'Building B, Floor 2',
                cost_per_hour: 45,
                availability: this.generateAvailability(),
                utilization_rate: 85,
                condition: 'good',
                maintenance_schedule: '2024-01-30'
            },
            {
                id: 'auditorium_c',
                name: 'Main Auditorium',
                type: 'auditorium',
                category: 'large_venue',
                capacity: 300,
                features: ['stage', 'sound_system', 'lighting', 'recording'],
                location: 'Building C',
                cost_per_hour: 150,
                availability: this.generateAvailability(),
                utilization_rate: 45,
                condition: 'excellent',
                maintenance_schedule: '2024-03-01'
            },
            // Equipment
            {
                id: 'projector_001',
                name: 'HD Projector #001',
                type: 'equipment',
                category: 'av_equipment',
                capacity: 1,
                features: ['4k_support', 'wireless', 'hdmi'],
                location: 'AV Storage',
                cost_per_hour: 15,
                availability: this.generateAvailability(),
                utilization_rate: 65,
                condition: 'good',
                maintenance_schedule: '2024-02-01'
            },
            {
                id: 'microscope_set_01',
                name: 'Microscope Set #01',
                type: 'equipment',
                category: 'lab_equipment',
                capacity: 10,
                features: ['digital_imaging', 'led_lighting'],
                location: 'Science Lab',
                cost_per_hour: 30,
                availability: this.generateAvailability(),
                utilization_rate: 70,
                condition: 'excellent',
                maintenance_schedule: '2024-01-25'
            },
            // Staff
            {
                id: 'instructor_smith',
                name: 'Dr. John Smith',
                type: 'staff',
                category: 'instructor',
                capacity: 1,
                features: ['mathematics', 'statistics', 'phd'],
                location: 'Faculty Office 301',
                cost_per_hour: 75,
                availability: this.generateStaffAvailability(),
                utilization_rate: 80,
                condition: 'active',
                specializations: ['calculus', 'linear_algebra', 'probability']
            },
            {
                id: 'tech_johnson',
                name: 'Mike Johnson',
                type: 'staff',
                category: 'technician',
                capacity: 1,
                features: ['av_support', 'computer_maintenance', 'networking'],
                location: 'IT Support',
                cost_per_hour: 35,
                availability: this.generateStaffAvailability(),
                utilization_rate: 60,
                condition: 'active',
                specializations: ['hardware', 'software', 'troubleshooting']
            }
        ];

        resourceData.forEach(resource => {
            this.resources.set(resource.id, resource);
        });
    }

    /**
     * Generate availability schedule for resources
     */
    generateAvailability() {
        const schedule = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        days.forEach(day => {
            schedule[day] = [];
            for (let hour = 8; hour <= 18; hour++) {
                const available = Math.random() > 0.2; // 80% availability
                schedule[day].push({
                    hour: hour,
                    available: available,
                    allocation: available ? null : {
                        course: 'Reserved',
                        instructor: 'TBD',
                        type: 'class'
                    }
                });
            }
        });
        
        return schedule;
    }

    /**
     * Generate staff availability (more restricted)
     */
    generateStaffAvailability() {
        const schedule = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        days.forEach(day => {
            schedule[day] = [];
            for (let hour = 8; hour <= 17; hour++) {
                const available = Math.random() > 0.4; // 60% availability
                schedule[day].push({
                    hour: hour,
                    available: available,
                    allocation: available ? null : {
                        activity: 'Teaching/Meeting',
                        type: 'committed'
                    }
                });
            }
        });
        
        return schedule;
    }

    /**
     * Smart resource allocation algorithm
     */
    allocateResources(request) {
        const {
            type,
            capacity_needed,
            features_required = [],
            time_slot,
            duration = 1,
            priority = 'medium',
            budget_limit = null
        } = request;

        const candidates = this.findCandidateResources(type, capacity_needed, features_required);
        const availableCandidates = this.filterByAvailability(candidates, time_slot, duration);
        const optimizedSelection = this.optimizeSelection(availableCandidates, request);

        if (optimizedSelection.length === 0) {
            return {
                success: false,
                message: 'No suitable resources available',
                alternatives: this.suggestAlternatives(request)
            };
        }

        // Create allocation
        const allocationId = this.createAllocation(optimizedSelection, request);
        
        return {
            success: true,
            allocation_id: allocationId,
            resources: optimizedSelection,
            total_cost: this.calculateTotalCost(optimizedSelection, duration),
            utilization_impact: this.calculateUtilizationImpact(optimizedSelection),
            recommendations: this.generateRecommendations(optimizedSelection, request)
        };
    }

    /**
     * Find candidate resources based on type and requirements
     */
    findCandidateResources(type, capacityNeeded, featuresRequired) {
        const candidates = [];
        
        for (const [id, resource] of this.resources) {
            if (resource.type === type && resource.capacity >= capacityNeeded) {
                const hasRequiredFeatures = featuresRequired.every(feature => 
                    resource.features.includes(feature)
                );
                
                if (hasRequiredFeatures) {
                    candidates.push({
                        ...resource,
                        suitability_score: this.calculateSuitabilityScore(resource, {
                            capacity: capacityNeeded,
                            features: featuresRequired
                        })
                    });
                }
            }
        }
        
        return candidates.sort((a, b) => b.suitability_score - a.suitability_score);
    }

    /**
     * Calculate suitability score for resource matching
     */
    calculateSuitabilityScore(resource, requirements) {
        let score = 100;
        
        // Capacity efficiency (prefer resources closer to required capacity)
        const capacityRatio = requirements.capacity / resource.capacity;
        if (capacityRatio > 0.8) {
            score += 20; // Efficient use
        } else if (capacityRatio < 0.5) {
            score -= 10; // Underutilized
        }
        
        // Feature bonus
        const extraFeatures = resource.features.length - requirements.features.length;
        score += extraFeatures * 5;
        
        // Utilization penalty (prefer underutilized resources)
        score -= (resource.utilization_rate - 50) * 0.5;
        
        // Condition bonus
        if (resource.condition === 'excellent') score += 15;
        else if (resource.condition === 'good') score += 10;
        else score -= 5;
        
        // Cost efficiency
        score -= resource.cost_per_hour * 0.1;
        
        return Math.max(0, score);
    }

    /**
     * Filter resources by availability
     */
    filterByAvailability(candidates, timeSlot, duration) {
        return candidates.filter(resource => {
            return this.isResourceAvailable(resource, timeSlot, duration);
        });
    }

    /**
     * Check if resource is available for the requested time
     */
    isResourceAvailable(resource, timeSlot, duration) {
        const { day, start_hour } = timeSlot;
        
        if (!resource.availability[day]) return false;
        
        for (let hour = start_hour; hour < start_hour + duration; hour++) {
            const slot = resource.availability[day].find(s => s.hour === hour);
            if (!slot || !slot.available) return false;
        }
        
        return true;
    }

    /**
     * Optimize resource selection
     */
    optimizeSelection(candidates, request) {
        if (candidates.length === 0) return [];
        
        // For now, return the best candidate
        // In a more sophisticated system, this would use complex optimization algorithms
        const best = candidates[0];
        
        // Check budget constraints
        if (request.budget_limit) {
            const cost = best.cost_per_hour * (request.duration || 1);
            if (cost > request.budget_limit) {
                return candidates.filter(c => 
                    c.cost_per_hour * (request.duration || 1) <= request.budget_limit
                ).slice(0, 1);
            }
        }
        
        return [best];
    }

    /**
     * Create allocation record
     */
    createAllocation(resources, request) {
        const allocationId = this.generateId('alloc');
        const allocation = {
            id: allocationId,
            resources: resources.map(r => r.id),
            request: request,
            created: new Date(),
            status: 'confirmed',
            cost: this.calculateTotalCost(resources, request.duration || 1),
            efficiency_score: this.calculateEfficiencyScore(resources, request)
        };
        
        this.allocations.set(allocationId, allocation);
        
        // Update resource availability
        resources.forEach(resource => {
            this.markResourceAsAllocated(resource, request.time_slot, request.duration || 1);
        });
        
        return allocationId;
    }

    /**
     * Mark resource as allocated
     */
    markResourceAsAllocated(resource, timeSlot, duration) {
        const { day, start_hour } = timeSlot;
        const resourceData = this.resources.get(resource.id);
        
        if (resourceData && resourceData.availability[day]) {
            for (let hour = start_hour; hour < start_hour + duration; hour++) {
                const slot = resourceData.availability[day].find(s => s.hour === hour);
                if (slot) {
                    slot.available = false;
                    slot.allocation = {
                        allocation_id: this.allocations.size,
                        type: 'reserved'
                    };
                }
            }
        }
    }

    /**
     * Calculate total cost
     */
    calculateTotalCost(resources, duration) {
        return resources.reduce((total, resource) => {
            return total + (resource.cost_per_hour * duration);
        }, 0);
    }

    /**
     * Calculate utilization impact
     */
    calculateUtilizationImpact(resources) {
        return resources.map(resource => ({
            resource_id: resource.id,
            current_utilization: resource.utilization_rate,
            new_utilization: resource.utilization_rate + 5, // Simplified calculation
            impact: 'positive'
        }));
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(resources, request) {
        const recommendations = [];
        
        resources.forEach(resource => {
            if (resource.utilization_rate > 90) {
                recommendations.push({
                    type: 'warning',
                    message: `${resource.name} is heavily utilized. Consider alternative resources.`,
                    resource_id: resource.id
                });
            }
            
            if (resource.condition !== 'excellent') {
                recommendations.push({
                    type: 'maintenance',
                    message: `${resource.name} may need maintenance soon.`,
                    resource_id: resource.id,
                    scheduled: resource.maintenance_schedule
                });
            }
        });
        
        return recommendations;
    }

    /**
     * Suggest alternatives when allocation fails
     */
    suggestAlternatives(request) {
        const alternatives = [];
        
        // Suggest different time slots
        const timeAlternatives = this.findAlternativeTimeSlots(request);
        alternatives.push(...timeAlternatives);
        
        // Suggest different resource types
        const resourceAlternatives = this.findAlternativeResources(request);
        alternatives.push(...resourceAlternatives);
        
        return alternatives;
    }

    /**
     * Find alternative time slots
     */
    findAlternativeTimeSlots(request) {
        const alternatives = [];
        const { day, start_hour } = request.time_slot;
        
        // Check earlier and later hours on the same day
        for (let hour of [start_hour - 1, start_hour + 1, start_hour - 2, start_hour + 2]) {
            if (hour >= 8 && hour <= 18) {
                const alternativeRequest = {
                    ...request,
                    time_slot: { ...request.time_slot, start_hour: hour }
                };
                
                const result = this.allocateResources(alternativeRequest);
                if (result.success) {
                    alternatives.push({
                        type: 'time_adjustment',
                        original_time: start_hour,
                        suggested_time: hour,
                        resources: result.resources
                    });
                }
            }
        }
        
        return alternatives;
    }

    /**
     * Find alternative resources
     */
    findAlternativeResources(request) {
        const alternatives = [];
        
        // Suggest resources with similar features but different capacity
        const similarResources = this.findSimilarResources(request);
        
        similarResources.forEach(resource => {
            if (this.isResourceAvailable(resource, request.time_slot, request.duration || 1)) {
                alternatives.push({
                    type: 'resource_substitution',
                    original_requirements: request,
                    suggested_resource: resource,
                    trade_offs: this.analyzeTradeOffs(request, resource)
                });
            }
        });
        
        return alternatives;
    }

    /**
     * Find similar resources
     */
    findSimilarResources(request) {
        const similar = [];
        
        for (const [id, resource] of this.resources) {
            if (resource.type === request.type) {
                const commonFeatures = resource.features.filter(f => 
                    request.features_required.includes(f)
                ).length;
                
                if (commonFeatures >= request.features_required.length * 0.7) {
                    similar.push(resource);
                }
            }
        }
        
        return similar;
    }

    /**
     * Analyze trade-offs for alternative resources
     */
    analyzeTradeOffs(request, resource) {
        const tradeOffs = [];
        
        if (resource.capacity < request.capacity_needed) {
            tradeOffs.push({
                type: 'capacity_reduction',
                impact: 'negative',
                details: `Capacity reduced from ${request.capacity_needed} to ${resource.capacity}`
            });
        }
        
        if (resource.cost_per_hour > 50) {
            tradeOffs.push({
                type: 'cost_increase',
                impact: 'negative',
                details: `Higher cost: $${resource.cost_per_hour}/hour`
            });
        }
        
        const extraFeatures = resource.features.filter(f => 
            !request.features_required.includes(f)
        );
        
        if (extraFeatures.length > 0) {
            tradeOffs.push({
                type: 'additional_features',
                impact: 'positive',
                details: `Additional features: ${extraFeatures.join(', ')}`
            });
        }
        
        return tradeOffs;
    }

    /**
     * Get resource analytics
     */
    getResourceAnalytics() {
        const analytics = {
            utilization: {},
            costs: {},
            efficiency: {},
            predictions: {},
            recommendations: []
        };
        
        // Calculate utilization metrics
        for (const [id, resource] of this.resources) {
            analytics.utilization[id] = {
                current: resource.utilization_rate,
                optimal: 75,
                trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
                efficiency: resource.utilization_rate / 75 * 100
            };
        }
        
        // Calculate cost metrics
        const totalCosts = Array.from(this.allocations.values()).reduce((sum, alloc) => sum + alloc.cost, 0);
        analytics.costs = {
            total_monthly: totalCosts,
            average_per_allocation: totalCosts / this.allocations.size || 0,
            cost_per_hour_by_type: this.getCostsByType(),
            savings_opportunities: this.identifySavingsOpportunities()
        };
        
        // Generate predictions
        analytics.predictions = {
            demand_forecast: this.forecastDemand(),
            capacity_requirements: this.predictCapacityNeeds(),
            maintenance_schedule: this.optimizeMaintenanceSchedule()
        };
        
        // Generate recommendations
        analytics.recommendations = this.generateAnalyticsRecommendations();
        
        return analytics;
    }

    /**
     * Get costs by resource type
     */
    getCostsByType() {
        const costsByType = {};
        
        for (const [id, resource] of this.resources) {
            if (!costsByType[resource.type]) {
                costsByType[resource.type] = {
                    total: 0,
                    count: 0,
                    average: 0
                };
            }
            
            costsByType[resource.type].total += resource.cost_per_hour;
            costsByType[resource.type].count += 1;
            costsByType[resource.type].average = costsByType[resource.type].total / costsByType[resource.type].count;
        }
        
        return costsByType;
    }

    /**
     * Identify cost savings opportunities
     */
    identifySavingsOpportunities() {
        const opportunities = [];
        
        for (const [id, resource] of this.resources) {
            if (resource.utilization_rate < 50) {
                opportunities.push({
                    resource_id: id,
                    type: 'underutilization',
                    potential_saving: resource.cost_per_hour * 20, // 20 hours per week
                    recommendation: 'Consider reducing allocation or finding alternative uses'
                });
            }
            
            if (resource.cost_per_hour > 100 && resource.utilization_rate < 70) {
                opportunities.push({
                    resource_id: id,
                    type: 'expensive_underutilized',
                    potential_saving: resource.cost_per_hour * 10,
                    recommendation: 'High-cost resource with low utilization - review necessity'
                });
            }
        }
        
        return opportunities;
    }

    /**
     * Forecast demand
     */
    forecastDemand() {
        return {
            next_week: {
                classrooms: 85,
                labs: 70,
                equipment: 60
            },
            next_month: {
                classrooms: 90,
                labs: 75,
                equipment: 65
            },
            seasonal_trends: {
                peak_periods: ['September', 'January'],
                low_periods: ['June', 'July', 'December']
            }
        };
    }

    /**
     * Predict capacity needs
     */
    predictCapacityNeeds() {
        return {
            additional_classrooms_needed: 2,
            lab_upgrade_required: true,
            equipment_expansion: {
                projectors: 3,
                computers: 15,
                lab_equipment: 5
            },
            timeline: 'Next semester'
        };
    }

    /**
     * Optimize maintenance schedule
     */
    optimizeMaintenanceSchedule() {
        const schedule = [];
        
        for (const [id, resource] of this.resources) {
            if (new Date(resource.maintenance_schedule) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
                schedule.push({
                    resource_id: id,
                    name: resource.name,
                    scheduled_date: resource.maintenance_schedule,
                    priority: resource.condition === 'poor' ? 'high' : 'medium',
                    estimated_downtime: '4 hours',
                    cost_estimate: 500
                });
            }
        }
        
        return schedule;
    }

    /**
     * Generate analytics recommendations
     */
    generateAnalyticsRecommendations() {
        const recommendations = [];
        
        recommendations.push({
            type: 'optimization',
            title: 'Resource Utilization Optimization',
            description: 'Redistribute high-demand resources to improve overall efficiency',
            impact: 'high',
            effort: 'medium'
        });
        
        recommendations.push({
            type: 'cost_saving',
            title: 'Maintenance Schedule Optimization',
            description: 'Consolidate maintenance activities to reduce downtime and costs',
            impact: 'medium',
            effort: 'low'
        });
        
        recommendations.push({
            type: 'capacity_planning',
            title: 'Future Capacity Expansion',
            description: 'Plan for upcoming semester capacity requirements',
            impact: 'high',
            effort: 'high'
        });
        
        return recommendations;
    }

    /**
     * Start optimization engine
     */
    startOptimizationEngine() {
        setInterval(() => {
            this.runOptimizationCycle();
        }, 300000); // Run every 5 minutes
    }

    /**
     * Run optimization cycle
     */
    runOptimizationCycle() {
        // Identify optimization opportunities
        this.identifyConflicts();
        this.optimizeUtilization();
        this.updateAnalytics();
    }

    /**
     * Identify scheduling conflicts
     */
    identifyConflicts() {
        // Implementation for conflict detection
        console.log('Checking for resource conflicts...');
    }

    /**
     * Optimize resource utilization
     */
    optimizeUtilization() {
        // Implementation for utilization optimization
        console.log('Optimizing resource utilization...');
    }

    /**
     * Update analytics
     */
    updateAnalytics() {
        this.analytics = this.getResourceAnalytics();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for allocation requests
        document.addEventListener('resource-allocation-request', (e) => {
            const result = this.allocateResources(e.detail);
            e.detail.callback(result);
        });
    }

    /**
     * Calculate efficiency score
     */
    calculateEfficiencyScore(resources, request) {
        let score = 100;
        
        resources.forEach(resource => {
            // Capacity efficiency
            const capacityRatio = request.capacity_needed / resource.capacity;
            if (capacityRatio > 0.8) score += 10;
            else if (capacityRatio < 0.5) score -= 5;
            
            // Cost efficiency
            if (resource.cost_per_hour < 30) score += 5;
            else if (resource.cost_per_hour > 80) score -= 5;
            
            // Utilization balance
            if (resource.utilization_rate > 90) score -= 10;
            else if (resource.utilization_rate < 60) score += 5;
        });
        
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Utility function to generate IDs
     */
    generateId(prefix = 'res') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
}

// Initialize resource manager
const resourceManager = new ResourceManager();

// Export for global access
window.ResourceManager = ResourceManager;
window.resourceManager = resourceManager;