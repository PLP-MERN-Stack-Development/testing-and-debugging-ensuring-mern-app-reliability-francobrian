// client/src/utils/performanceMonitor.js
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
  }

  startMeasure(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  endMeasure(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      this.notifyObservers(name, metric);
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${name}: ${metric.duration.toFixed(2)}ms`);
      }
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production' && metric.duration > 1000) {
        this.sendToAnalytics(name, metric);
      }
    }
  }

  measurePageLoad() {
    if (document.readyState === 'complete') {
      this.measurePerformance();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.measurePerformance(), 0);
      });
    }
  }

  measurePerformance() {
    // Navigation Timing API
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    const metrics = {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      contentLoad: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      fullLoad: navigation.loadEventEnd - navigation.navigationStart,
      firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
    };

    console.table(metrics);
    
    // Log slow metrics
    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 1000) {
        console.warn(`Slow metric detected: ${name} - ${value.toFixed(2)}ms`);
      }
    });
  }

  addObserver(callback) {
    this.observers.push(callback);
  }

  notifyObservers(name, metric) {
    this.observers.forEach(callback => callback(name, metric));
  }

  sendToAnalytics(name, metric) {
    // Send to your analytics service
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        duration: metric.duration,
        url: window.location.href,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {/* Silent fail */});
  }
}

// Singleton instance
export default new PerformanceMonitor();