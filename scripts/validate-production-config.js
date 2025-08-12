#!/usr/bin/env node

/**
 * Production Configuration Validator
 * This script validates that all required environment variables are properly configured for production
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ERROR: ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  WARNING: ${message}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Required environment variables for production
const requiredEnvVars = {
  // Database
  'DB_HOST': {
    required: true,
    description: 'Database host',
    validate: (value) => value && value.length > 0
  },
  'DB_PORT': {
    required: true,
    description: 'Database port',
    validate: (value) => value && !isNaN(parseInt(value)) && parseInt(value) > 0
  },
  'DB_NAME': {
    required: true,
    description: 'Database name',
    validate: (value) => value && value.length > 0
  },
  'DB_USER': {
    required: true,
    description: 'Database user',
    validate: (value) => value && value.length > 0
  },
  'DB_PASSWORD': {
    required: true,
    description: 'Database password',
    validate: (value) => value && value.length >= 12,
    securityCheck: (value) => {
      if (!value) return false;
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      return hasUpper && hasLower && hasNumber && hasSpecial;
    }
  },
  
  // JWT
  'JWT_SECRET': {
    required: true,
    description: 'JWT secret key',
    validate: (value) => value && value.length >= 32,
    securityCheck: (value) => {
      if (!value) return false;
      // Check for randomness (not just repeated characters)
      const uniqueChars = new Set(value).size;
      return uniqueChars >= 16;
    }
  },
  'JWT_EXPIRES_IN': {
    required: true,
    description: 'JWT expiration time',
    validate: (value) => value && /^\d+[hdm]$/.test(value)
  },
  
  // CORS
  'CORS_ORIGIN': {
    required: true,
    description: 'CORS origin',
    validate: (value) => value && (value.startsWith('https://') || value === 'http://localhost:3000'),
    securityCheck: (value) => value && value.startsWith('https://')
  },
  
  // Frontend
  'VITE_API_BASE_URL': {
    required: true,
    description: 'Frontend API base URL',
    validate: (value) => value && (value.startsWith('https://') || value.startsWith('http://localhost'))
  }
};

// Security checks
const securityChecks = [
  {
    name: 'NODE_ENV is set to production',
    check: (env) => env.NODE_ENV === 'production'
  },
  {
    name: 'Database password is strong',
    check: (env) => {
      const password = env.DB_PASSWORD;
      return password && password.length >= 12 && 
             /[A-Z]/.test(password) && 
             /[a-z]/.test(password) && 
             /\d/.test(password) && 
             /[!@#$%^&*(),.?":{}|<>]/.test(password);
    }
  },
  {
    name: 'JWT secret is cryptographically secure',
    check: (env) => {
      const secret = env.JWT_SECRET;
      return secret && secret.length >= 32 && new Set(secret).size >= 16;
    }
  },
  {
    name: 'CORS origin uses HTTPS',
    check: (env) => {
      const origin = env.CORS_ORIGIN;
      return origin && (origin.startsWith('https://') || origin === 'http://localhost:3000');
    }
  },
  {
    name: 'JWT expiration is reasonable (not too long)',
    check: (env) => {
      const expires = env.JWT_EXPIRES_IN;
      if (!expires) return false;
      
      const match = expires.match(/^(\d+)([hdm])$/);
      if (!match) return false;
      
      const [, num, unit] = match;
      const hours = unit === 'h' ? parseInt(num) : 
                   unit === 'd' ? parseInt(num) * 24 : 
                   parseInt(num) / 60;
      
      return hours <= 24; // Max 24 hours
    }
  }
];

function loadEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return env;
  } catch (error) {
    logError(`Failed to load environment file: ${filePath}`);
    return null;
  }
}

function validateEnvironment(env, envFileName) {
  logInfo(`Validating ${envFileName}...`);
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Determine which variables are relevant for this environment file
  const isBackendEnv = envFileName.includes('backend');
  const isFrontendEnv = envFileName.includes('frontend');
  const isMainEnv = !isBackendEnv && !isFrontendEnv;
  
  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, config]) => {
    const value = env[key];
    
    // Skip frontend-specific variables for backend env files
    if (isBackendEnv && key.startsWith('VITE_')) {
      return;
    }
    
    // Skip backend-specific variables for frontend env files
    if (isFrontendEnv && (key.startsWith('DB_') || key.startsWith('JWT_') || key === 'CORS_ORIGIN')) {
      return;
    }
    
    if (config.required && !value) {
      logError(`Missing required environment variable: ${key} (${config.description})`);
      hasErrors = true;
      return;
    }
    
    if (value && config.validate && !config.validate(value)) {
      logError(`Invalid value for ${key}: ${config.description}`);
      hasErrors = true;
      return;
    }
    
    if (value && config.securityCheck && !config.securityCheck(value)) {
      logWarning(`Security concern for ${key}: Consider using a stronger value`);
      hasWarnings = true;
    }
    
    if (value) {
      logSuccess(`${key}: OK`);
    }
  });
  
  return { hasErrors, hasWarnings };
}

function runSecurityChecks(env) {
  logInfo('Running security checks...');
  
  let hasSecurityIssues = false;
  
  securityChecks.forEach(check => {
    if (check.check(env)) {
      logSuccess(check.name);
    } else {
      logWarning(`Security check failed: ${check.name}`);
      hasSecurityIssues = true;
    }
  });
  
  return hasSecurityIssues;
}

function main() {
  log('🔒 Production Configuration Validator', 'blue');
  log('=====================================', 'blue');
  
  const envFiles = [
    '.env.production',
    'backend/.env.production',
    'frontend/.env.production'
  ];
  
  let totalErrors = false;
  let totalWarnings = false;
  let totalSecurityIssues = false;
  
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      const env = loadEnvFile(envFile);
      if (env) {
        const { hasErrors, hasWarnings } = validateEnvironment(env, envFile);
        const hasSecurityIssues = runSecurityChecks(env);
        
        totalErrors = totalErrors || hasErrors;
        totalWarnings = totalWarnings || hasWarnings;
        totalSecurityIssues = totalSecurityIssues || hasSecurityIssues;
      }
    } else {
      logWarning(`Environment file not found: ${envFile}`);
      totalWarnings = true;
    }
    
    console.log(''); // Empty line for readability
  });
  
  // Summary
  log('Summary:', 'blue');
  log('========', 'blue');
  
  if (totalErrors) {
    logError('Configuration validation failed! Please fix the errors above.');
    process.exit(1);
  } else if (totalWarnings || totalSecurityIssues) {
    logWarning('Configuration validation passed with warnings. Please review the warnings above.');
    process.exit(0);
  } else {
    logSuccess('All configuration checks passed! Ready for production deployment.');
    process.exit(0);
  }
}

// Run the validator
main();