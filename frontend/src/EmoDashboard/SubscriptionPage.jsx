import React, { useState, useEffect } from 'react';
import {
  Check,
  X,
  Star,
  Crown,
  Shield,
  Users,
  Clock,
  Zap,
  Award,
  Building2,
  Briefcase,
  Globe,
  BarChart3,
  Settings,
  HelpCircle,
  Download,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

// Enhanced subscription plans data
const subscriptionPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 999,
    yearlyPrice: 9999,
    description: 'Perfect for small businesses starting their security management journey',
    color: 'blue',
    popular: false,
    icon: Shield,
    features: [
      { name: 'Up to 10 Guards', included: true },
      { name: '2 Site Locations', included: true },
      { name: 'Basic Shift Planning', included: true },
      { name: 'Real-time Monitoring', included: true },
      { name: 'Mobile App Access', included: true },
      { name: 'Email Support', included: true },
      { name: 'Basic Reports', included: true },
      { name: 'Advanced Analytics', included: false },
      { name: 'Custom Integrations', included: false },
      { name: 'Priority Support', included: false },
      { name: 'White-label Branding', included: false },
      { name: 'API Access', included: false }
    ],
    benefits: [
      'Easy setup in under 30 minutes',
      'Mobile app for guards and supervisors',
      'Cloud-based secure storage',
      'Basic compliance reporting'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 2499,
    yearlyPrice: 24999,
    description: 'Ideal for growing businesses with multiple locations and teams',
    color: 'emerald',
    popular: true,
    icon: Building2,
    features: [
      { name: 'Up to 50 Guards', included: true },
      { name: '10 Site Locations', included: true },
      { name: 'Advanced Shift Planning', included: true },
      { name: 'Real-time Monitoring', included: true },
      { name: 'Mobile App Access', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Advanced Reports', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Basic Integrations', included: true },
      { name: 'Team Management', included: true },
      { name: 'White-label Branding', included: false },
      { name: 'API Access', included: false }
    ],
    benefits: [
      'Advanced workforce analytics',
      'Multi-location management',
      'Custom report generation',
      'Priority customer support',
      'Integration with popular HR tools'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 4999,
    yearlyPrice: 49999,
    description: 'Complete solution for large enterprises with complex requirements',
    color: 'purple',
    popular: false,
    icon: Crown,
    features: [
      { name: 'Unlimited Guards', included: true },
      { name: 'Unlimited Locations', included: true },
      { name: 'AI-Powered Planning', included: true },
      { name: 'Real-time Monitoring', included: true },
      { name: 'Mobile App Access', included: true },
      { name: '24/7 Dedicated Support', included: true },
      { name: 'Custom Reports', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Custom Integrations', included: true },
      { name: 'Team Management', included: true },
      { name: 'White-label Branding', included: true },
      { name: 'Full API Access', included: true }
    ],
    benefits: [
      'Dedicated account manager',
      'Custom feature development',
      'Advanced security & compliance',
      'On-premise deployment option',
      'White-label customization',
      'Advanced API integrations'
    ]
  }
];

// Current subscription data (mock)
const currentSubscription = {
  plan: 'professional',
  status: 'active',
  nextBilling: '2024-02-15',
  amount: 2499,
  usage: {
    guards: { current: 32, limit: 50 },
    locations: { current: 6, limit: 10 },
    storage: { current: 15.2, limit: 50 }
  }
};

// Usage stats
const usageStats = [
  {
    label: 'Active Guards',
    value: currentSubscription.usage.guards.current,
    limit: currentSubscription.usage.guards.limit,
    unit: 'guards',
    icon: Users,
    color: 'blue'
  },
  {
    label: 'Site Locations',
    value: currentSubscription.usage.locations.current,
    limit: currentSubscription.usage.locations.limit,
    unit: 'sites',
    icon: Building2,
    color: 'emerald'
  },
  {
    label: 'Storage Used',
    value: currentSubscription.usage.storage.current,
    limit: currentSubscription.usage.storage.limit,
    unit: 'GB',
    icon: BarChart3,
    color: 'purple'
  }
];

// Plan comparison features
const comparisonFeatures = [
  { name: 'Number of Guards', starter: '10', professional: '50', enterprise: 'Unlimited' },
  { name: 'Site Locations', starter: '2', professional: '10', enterprise: 'Unlimited' },
  { name: 'Storage Space', starter: '5 GB', professional: '50 GB', enterprise: 'Unlimited' },
  { name: 'Mobile App', starter: 'Basic', professional: 'Advanced', enterprise: 'Premium' },
  { name: 'Analytics', starter: 'Basic', professional: 'Advanced', enterprise: 'AI-Powered' },
  { name: 'Support', starter: 'Email', professional: 'Priority', enterprise: '24/7 Dedicated' },
  { name: 'API Access', starter: 'No', professional: 'Limited', enterprise: 'Full' },
  { name: 'White-label', starter: 'No', professional: 'No', enterprise: 'Yes' }
];

// Plan Card Component
const PlanCard = ({ plan, isYearly, onSelect, isCurrentPlan }) => {
  const price = isYearly ? plan.yearlyPrice : plan.price;
  const monthlyPrice = isYearly ? Math.round(plan.yearlyPrice / 12) : plan.price;
  const savings = isYearly ? Math.round(((plan.price * 12 - plan.yearlyPrice) / (plan.price * 12)) * 100) : 0;
  
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600'
  };
  
  const IconComponent = plan.icon;

  return (
    <div className={`relative bg-white border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
      plan.popular ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-slate-200'
    } ${isCurrentPlan ? 'ring-4 ring-blue-100 border-blue-500' : ''}`}>
      
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Most Popular</span>
          </div>
        </div>
      )}
      
      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Current</span>
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${colorClasses[plan.color]} flex items-center justify-center`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{plan.description}</p>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          <div className="flex items-end justify-center space-x-2 mb-2">
            <span className="text-4xl font-bold text-slate-800">₹{monthlyPrice.toLocaleString()}</span>
            <span className="text-slate-500 text-lg font-medium">/month</span>
          </div>
          
          {isYearly && savings > 0 && (
            <div className="flex items-center justify-center space-x-2 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Save {savings}% annually</span>
            </div>
          )}
          
          {isYearly && (
            <p className="text-xs text-slate-500 mt-1">
              Billed annually: ₹{plan.yearlyPrice.toLocaleString()}
            </p>
          )}
        </div>

        {/* Features */}
        <div className="mb-8">
          <h4 className="font-semibold text-slate-800 mb-4 text-center">Key Features</h4>
          <div className="space-y-3">
            {plan.features.slice(0, 6).map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                {feature.included ? (
                  <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-slate-400" />
                  </div>
                )}
                <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                  {feature.name}
                </span>
              </div>
            ))}
          </div>
          
          {plan.features.length > 6 && (
            <p className="text-xs text-slate-500 text-center mt-3">
              +{plan.features.length - 6} more features
            </p>
          )}
        </div>

        {/* Benefits */}
        <div className="mb-8">
          <h4 className="font-semibold text-slate-800 mb-3 text-center">Benefits</h4>
          <div className="space-y-2">
            {plan.benefits.slice(0, 3).map((benefit, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Target className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-600">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onSelect(plan)}
          disabled={isCurrentPlan}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 ${
            isCurrentPlan 
              ? 'bg-slate-400 cursor-not-allowed' 
              : plan.popular
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                : `bg-gradient-to-r ${colorClasses[plan.color]} hover:shadow-lg hover:shadow-xl`
          }`}
        >
          {isCurrentPlan ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Current Plan</span>
            </>
          ) : (
            <>
              <span>{plan.id === 'starter' ? 'Start Free Trial' : 'Upgrade Now'}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Usage Card Component
const UsageCard = ({ stat }) => {
  const percentage = (stat.value / stat.limit) * 100;
  const IconComponent = stat.icon;
  
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200'
  };

  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className={`border rounded-2xl p-6 ${colorClasses[stat.color]} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-white shadow-sm">
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-sm opacity-75">of {stat.limit} {stat.unit}</p>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium opacity-75">{stat.label}</span>
          <span className="text-sm font-bold">{percentage.toFixed(0)}%</span>
        </div>
        
        <div className="w-full bg-white bg-opacity-50 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        
        {percentage >= 85 && (
          <div className="mt-2 p-2 bg-amber-100 border border-amber-200 rounded-lg">
            <div className="flex items-center text-amber-700">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-xs font-medium">Approaching limit</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
export default function SubscriptionPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (plan.id === currentSubscription.plan) {
        toast.info(`You're already on the ${plan.name} plan`);
      } else {
        toast.success(`Redirecting to checkout for ${plan.name} plan...`);
        // In real app, redirect to payment gateway
      }
    }, 1500);
  };

  const getCurrentPlan = () => {
    return subscriptionPlans.find(p => p.id === currentSubscription.plan);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadInvoice = () => {
    toast.success('Invoice downloaded successfully');
  };

  const handleManageBilling = () => {
    toast.info('Redirecting to billing portal...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Subscription Management
                </h1>
              </div>
              <p className="text-slate-600 font-medium">
                Manage your subscription, view usage, and upgrade your plan
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
              >
                <Download size={18} />
                <span>Download Invoice</span>
              </button>
              
              <button
                onClick={handleManageBilling}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <CreditCard size={18} />
                <span>Manage Billing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current Subscription Status */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Award className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">Current Subscription</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div>
                  <h3 className="font-bold text-emerald-800">{getCurrentPlan()?.name} Plan</h3>
                  <p className="text-emerald-600 text-sm">Active Subscription</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-800">₹{currentSubscription.amount.toLocaleString()}</p>
                  <p className="text-emerald-600 text-sm">per month</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-600">Next Billing</span>
                  </div>
                  <p className="font-bold text-slate-800">{formatDate(currentSubscription.nextBilling)}</p>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-600">Status</span>
                  </div>
                  <p className="font-bold text-emerald-600 capitalize">{currentSubscription.status}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-4">Current Usage</h3>
              <div className="grid grid-cols-1 gap-4">
                {usageStats.map((stat, index) => (
                  <UsageCard key={index} stat={stat} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Choose Your Plan</h2>
            <p className="text-slate-600">Select the perfect plan for your security management needs</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-200"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Compare Plans</span>
            </button>
            
            <div className="flex items-center space-x-3 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !isYearly 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                  isYearly 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Yearly
                {isYearly && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                    Save 17%
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Plan Comparison Table */}
        {showComparison && (
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Plan Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-4 font-semibold text-slate-700">Features</th>
                    <th className="text-center p-4 font-semibold text-blue-600">Starter</th>
                    <th className="text-center p-4 font-semibold text-emerald-600">Professional</th>
                    <th className="text-center p-4 font-semibold text-purple-600">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-700">{feature.name}</td>
                      <td className="p-4 text-center text-slate-600">{feature.starter}</td>
                      <td className="p-4 text-center text-slate-600">{feature.professional}</td>
                      <td className="p-4 text-center text-slate-600">{feature.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {subscriptionPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isYearly={isYearly}
              onSelect={handlePlanSelect}
              isCurrentPlan={plan.id === currentSubscription.plan}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Subscription FAQ</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">Can I change my plan anytime?</h4>
                  <p>Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated.</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">What happens if I exceed my limits?</h4>
                  <p>We'll notify you when you're approaching limits. You can upgrade to avoid service interruption.</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">Is there a free trial?</h4>
                  <p>Yes, all plans come with a 14-day free trial. No credit card required.</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">How secure is my data?</h4>
                  <p>We use enterprise-grade encryption and comply with industry security standards.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Processing...</h3>
                <p className="text-slate-600">Please wait while we process your request</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
