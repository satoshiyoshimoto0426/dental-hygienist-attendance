# Production Security Checklist

## Database Security
- [ ] Database user has minimal required permissions
- [ ] Database password is strong (minimum 16 characters, mixed case, numbers, symbols)
- [ ] Database connection is encrypted (SSL/TLS)
- [ ] Database backup user has read-only access
- [ ] Connection limits are configured
- [ ] Database logging is enabled for security monitoring

## Application Security
- [ ] JWT secret is cryptographically secure (minimum 32 characters)
- [ ] JWT expiration time is appropriate (24 hours recommended)
- [ ] Password hashing uses bcrypt with sufficient rounds (12+)
- [ ] Rate limiting is configured for API endpoints
- [ ] Stricter rate limiting for authentication endpoints
- [ ] CORS is configured with specific origins (no wildcards)
- [ ] Input validation is implemented on all endpoints
- [ ] SQL injection protection through parameterized queries

## Web Server Security
- [ ] Security headers are configured (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] Content Security Policy (CSP) is implemented
- [ ] HTTPS is enabled with valid SSL certificates
- [ ] HTTP redirects to HTTPS
- [ ] SSL/TLS configuration uses modern protocols (TLS 1.2+)
- [ ] Weak ciphers are disabled
- [ ] HSTS header is configured
- [ ] Access to sensitive files is denied (.env, .log, etc.)

## Container Security
- [ ] Containers run as non-root users
- [ ] Base images are from trusted sources and regularly updated
- [ ] Unnecessary packages are removed from containers
- [ ] Container resources are limited (CPU, memory)
- [ ] Health checks are implemented
- [ ] Secrets are not embedded in container images

## Network Security
- [ ] Internal network communication is isolated
- [ ] Database is not directly accessible from outside
- [ ] Firewall rules are configured appropriately
- [ ] VPN or bastion host for administrative access
- [ ] Regular security updates are applied

## Monitoring and Logging
- [ ] Application logs are configured and monitored
- [ ] Database query logging is enabled
- [ ] Failed authentication attempts are logged
- [ ] Log rotation is configured
- [ ] Security monitoring alerts are set up
- [ ] Regular security audits are scheduled

## Backup and Recovery
- [ ] Regular database backups are configured
- [ ] Backup encryption is enabled
- [ ] Backup restoration procedures are tested
- [ ] Disaster recovery plan is documented
- [ ] Data retention policies are implemented

## Environment Configuration
- [ ] Production environment variables are secured
- [ ] Development/debug features are disabled
- [ ] Error messages don't expose sensitive information
- [ ] Default passwords are changed
- [ ] Unused services are disabled