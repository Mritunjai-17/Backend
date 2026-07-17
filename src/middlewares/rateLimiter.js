const rateLimitWindowMs = 15 * 60 * 1000; // 15 minutes
const maxRequestsPerWindow = 5; // Max 5 submissions per 15 minutes per IP
const ipCache = new Map();

const contactRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  if (!ipCache.has(ip)) {
    ipCache.set(ip, []);
  }

  // Filter timestamps to only keep ones within the current window
  const timestamps = ipCache.get(ip).filter(timestamp => now - timestamp < rateLimitWindowMs);
  
  if (timestamps.length >= maxRequestsPerWindow) {
    return res.status(429).json({
      success: false,
      error: 'Too many contact requests from this IP. Please try again after 15 minutes.'
    });
  }

  timestamps.push(now);
  ipCache.set(ip, timestamps);
  next();
};

module.exports = {
  contactRateLimiter
};
