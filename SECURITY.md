# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Visual AI Agent seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Where to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them by:
1. Creating a private security advisory on GitHub
2. Or emailing details to the repository maintainers

### What to Include

Please include the following information in your report:
- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: 90 days

## Security Measures

### Current Security Features

1. **Authentication & Authorization**
   - JWT token-based authentication
   - bcrypt password hashing (10 salt rounds)
   - Role-based access control (User/Admin)
   - Token expiration (7 days)
   - Account suspension capability

2. **API Security**
   - Rate limiting (200 requests per 15 minutes)
   - Helmet security headers
   - CORS protection
   - Input validation
   - Request sanitization
   - XSS protection
   - Clickjacking protection

3. **File Upload Security**
   - File size limits (5MB)
   - MIME type validation
   - File extension validation
   - Secure file storage
   - Authenticated file access

4. **Data Protection**
   - Password hashing (never stored in plain text)
   - Secure session management
   - Database query parameterization
   - No sensitive data in logs
   - Environment variable protection

5. **Chrome Extension Security**
   - Manifest V3 compliance
   - Explicit permission requests
   - Content Security Policy
   - Secure message passing
   - No eval() or inline scripts

### Security Best Practices for Users

1. **Production Deployment**
   - Change default JWT_SECRET to a strong random string
   - Use HTTPS/SSL for all connections
   - Set strong MongoDB credentials
   - Use environment variables for secrets
   - Regularly update dependencies

2. **MongoDB Security**
   - Enable authentication
   - Use strong passwords
   - Restrict network access
   - Regular backups
   - Update to latest stable version

3. **API Key Protection**
   - Never commit API keys to git
   - Use environment variables
   - Rotate keys regularly
   - Use per-user keys when possible
   - Monitor API key usage

4. **Server Configuration**
   - Use firewall rules
   - Disable unnecessary services
   - Keep OS and software updated
   - Monitor logs for suspicious activity
   - Implement backup strategy

## Known Security Considerations

### Environment Variables
- Ensure `.env` files are never committed to git
- Use `.env.example` as template
- Rotate secrets regularly in production

### CORS Configuration
- Configure CORS for specific domains in production
- Avoid using `*` (allow all) in production

### Rate Limiting
- Adjust rate limits based on your needs
- Consider IP-based rate limiting for sensitive endpoints

### File Storage
- Uploaded screenshots are stored on filesystem
- Ensure proper file permissions
- Consider cloud storage for production

## Security Updates

Security updates will be released as patch versions (1.0.x) and will be announced through:
- GitHub releases
- CHANGELOG.md updates
- Security advisories

## Vulnerability Disclosure Policy

We follow coordinated vulnerability disclosure:
1. Researcher reports vulnerability privately
2. We confirm and develop a fix
3. We release the patch
4. Public disclosure after users have time to update (typically 30 days)

## Security Checklist for Deployment

Before deploying to production, ensure:

- [ ] JWT_SECRET is changed to a strong random string
- [ ] MongoDB authentication is enabled
- [ ] HTTPS/SSL is configured
- [ ] CORS is configured for specific domains
- [ ] Rate limiting is properly configured
- [ ] Environment variables are secured
- [ ] File upload directory has proper permissions
- [ ] Logs don't contain sensitive information
- [ ] Dependencies are up to date
- [ ] Backups are configured
- [ ] Monitoring is in place
- [ ] Firewall rules are configured

## Dependencies

We regularly update dependencies to patch security vulnerabilities:
- Backend dependencies: npm audit
- Frontend dependencies: npm audit
- Base Docker images: Latest stable versions

## Contact

For security concerns, please contact the maintainers through GitHub.

---

**Thank you for helping keep Visual AI Agent secure!**
