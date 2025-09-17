# Deployment Guide

This document describes how to deploy the MCP Registry Growth Dashboard to production.

## Production Build Requirements

The dashboard is built as a static Next.js export optimized for GitHub Pages deployment.

### System Requirements
- Node.js 18+ 
- npm 8+
- 2GB RAM minimum for build process
- Modern browser support (Chrome 88+, Firefox 78+, Safari 14+)

## Deployment Process

### Automated Deployment (Recommended)

The project includes automated GitHub Actions deployment:

1. **Push to main branch** triggers automatic deployment
2. **Tests run first** - deployment only proceeds if all tests pass
3. **Build verification** ensures static export is valid
4. **Deploy to GitHub Pages** - live site updates automatically

### Manual Deployment

If you need to deploy manually:

```bash
# 1. Install dependencies
npm ci

# 2. Run all tests
npm test
npx playwright test

# 3. Build for production
npm run build:prod

# 4. Verify build quality
npm run verify-build

# 5. Preview locally (optional)
npm run preview

# 6. Deploy static files from ./out directory
# Upload contents of ./out to your static hosting provider
```

## Environment Configuration

### Production Environment Variables

Set these in your deployment environment:

```bash
NODE_ENV=production
NEXT_PUBLIC_BASE_PATH=/mcp-registry-growth  # Adjust for your domain
NEXT_PUBLIC_ASSET_PREFIX=/mcp-registry-growth/
```

### Local Development

Copy `.env.example` to `.env.local` and customize:

```bash
cp .env.example .env.local
# Edit .env.local with your local settings
```

## Performance Optimizations

The production build includes:

- **Code splitting** - Chart libraries loaded on demand
- **Static generation** - Pre-built HTML for optimal loading
- **Asset optimization** - Minified CSS/JS with compression
- **Image optimization** - WebP format with fallbacks
- **Caching headers** - Long-term caching for static assets

## Build Verification

The deployment process includes automated checks:

- ✅ Required files exist (`index.html`, static assets, data files)
- ✅ HTML contains proper meta tags and content
- ✅ Analytics data is valid JSON
- ✅ All dependencies are resolved
- ✅ No broken links or missing assets

## Monitoring and Maintenance

### Build Monitoring
- GitHub Actions provides build status
- Failed builds prevent deployment
- Email notifications on build failures

### Performance Monitoring
- Lighthouse scores tracked in CI/CD
- Core Web Vitals compliance required
- Bundle size monitoring

### Data Updates
- CSV data converted to JSON during build
- Static data embedded in deployment
- No runtime API dependencies

## Troubleshooting

### Common Build Issues

**"Module not found" errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Static export fails:**
```bash
# Check for dynamic imports or SSR features
npm run type-check
npm run lint
```

**Tests fail in CI:**
```bash
# Run tests locally first
npm test
npx playwright test
```

### Performance Issues

**Large bundle size:**
- Check dynamic imports are working
- Verify code splitting is enabled
- Run `npm run build` and check bundle analyzer

**Slow loading:**
- Verify static export is working
- Check CDN configuration
- Validate asset compression

## Security Considerations

- No server-side code in production
- All data is static and public
- No API keys or secrets in frontend
- HTTPS enforced via GitHub Pages
- CSP headers recommended for additional security

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Verify build passes locally
3. Review environment variables
4. Check static hosting provider configuration