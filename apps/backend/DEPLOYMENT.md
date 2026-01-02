# Deployment Guide: Encore Backend to Coolify

This guide explains how to deploy the Encore backend to a Coolify server using Docker.

## Overview

The deployment process uses Encore's `encore build docker` command to generate a Docker image with a dynamic tag format: `scholatempus-backend:BRANCH-YYYYMMDD-HHMMSS`.

## Prerequisites

1. **Coolify Server**: A VPS running Coolify
2. **Encore CLI**: Must be installed on the Coolify server (or will be installed during build)
3. **GitHub Repository**: Your code must be pushed to GitHub
4. **Database**: PostgreSQL database accessible from the Coolify server
5. **Clerk Account**: For authentication (if using Clerk)

## Coolify Setup

### Option 1: Using Coolify's Native Git Integration (Recommended)

This is the simplest approach and leverages Coolify's built-in capabilities.

#### Step 1: Create Application in Coolify

1. Log into your Coolify dashboard
2. Navigate to **Applications** → **New Application**
3. Select **Docker Compose** or **Docker** as the application type

#### Step 2: Connect GitHub Repository

1. In the application settings, go to **Source**
2. Connect your GitHub repository
3. Select the repository: `scholatempus`
4. Set the **Branch** to deploy (e.g., `main`, `develop`, `production`)

#### Step 3: Configure Build Settings

1. Set **Root Directory**: `backend/`
2. Set **Build Command**: 
   ```bash
   ./build.sh
   ```
   
   Or if Coolify supports direct command execution:
   ```bash
   encore build docker scholatempus-backend:${GIT_BRANCH}-$(date +%Y%m%d-%H%M%S)
   ```

3. **Dockerfile**: Leave empty (Encore generates it automatically)

#### Step 4: Install Encore CLI (if needed)

If Encore CLI is not installed on your Coolify server, add this to your build command:

```bash
# Install Encore CLI
curl -L https://encore.dev/install.sh | bash
export PATH="$HOME/.encore/bin:$PATH"

# Run build script
./build.sh
```

Or create a custom build script that includes Encore installation.

#### Step 5: Configure Environment Variables

In Coolify's environment variables section, add the following:

**Required Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

**Optional Environment Variables:**

```bash
# Node Environment
NODE_ENV=production

# Encore App ID (if using Encore Cloud features)
ENCORE_APP_ID=your_app_id
```

**Encore Secrets:**

Encore secrets should be set using Encore's secret management. For self-hosted deployments, you can:

1. Use environment variables (mapped to Encore secrets)
2. Use Encore CLI to set secrets:
   ```bash
   encore secret set --type prod SecretName
   ```

#### Step 6: Configure Ports

1. Set the **Port** that your Encore application will listen on (default: `4000`)
2. Configure **Port Mapping** if needed (e.g., `4000:4000`)

#### Step 7: Configure Health Checks (Optional)

Add a health check endpoint if your application has one:

- **Path**: `/health` or `/api/health`
- **Interval**: 30 seconds
- **Timeout**: 5 seconds
- **Retries**: 3

#### Step 8: Deploy

1. Click **Deploy** or **Save & Deploy**
2. Monitor the build logs to ensure the build completes successfully
3. Check the application logs to verify it's running correctly

### Option 2: Using GitHub Actions with Docker Registry (Recommended for CI/CD)

This approach builds the Docker image in GitHub Actions and pushes it to a Docker registry, then Coolify pulls and deploys it.

#### Step 1: Choose a Docker Registry

**Recommended: GitHub Container Registry (GHCR)**
- ✅ Free for public repositories
- ✅ Integrated with GitHub (automatic authentication)
- ✅ No additional setup needed
- ✅ Images are stored alongside your code
- Format: `ghcr.io/OWNER/IMAGE_NAME:TAG`

**Alternative: Docker Hub**
- Free tier available (with rate limits)
- Widely supported
- Requires separate account setup
- Format: `docker.io/USERNAME/IMAGE_NAME:TAG`
- To use Docker Hub, update the workflow to:
  ```yaml
  - name: Log in to Docker Hub
    uses: docker/login-action@v3
    with:
      username: ${{ secrets.DOCKERHUB_USERNAME }}
      password: ${{ secrets.DOCKERHUB_TOKEN }}
  ```
  And change the image tag to: `docker.io/USERNAME/scholatempus-backend:BRANCH-TIMESTAMP`

**Alternative: Private Registry**
- Full control over storage and access
- Requires self-hosting or paid service
- More complex setup

#### Step 2: Configure GitHub Actions

The workflow (`.github/workflows/deploy-backend.yml`) automatically:
1. Builds the Docker image using `encore build docker`
2. Tags it with format: `ghcr.io/OWNER/scholatempus-backend:BRANCH-TIMESTAMP`
3. Pushes it to GitHub Container Registry

**No additional configuration needed** - the workflow uses `GITHUB_TOKEN` for authentication.

#### Step 3: Configure Coolify to Pull from Registry

1. In Coolify, create a new application
2. Select **Docker Image** as the source type (instead of Git)
3. Enter the image name: `ghcr.io/YOUR_USERNAME/scholatempus-backend:main-YYYYMMDD-HHMMSS`
4. **For authentication** (if repository is private):
   - Go to **Settings** → **Docker Registries**
   - Add GitHub Container Registry:
     - **Name**: `ghcr.io`
     - **Username**: Your GitHub username
     - **Password**: Create a [Personal Access Token](https://github.com/settings/tokens) with `read:packages` permission
5. Configure environment variables (same as Option 1)
6. Deploy

#### Step 4: Automatic Deployments

To automatically deploy when new images are pushed:

1. **Option A: Webhook from GitHub Actions**
   - Add a step to the workflow to trigger Coolify deployment via API/webhook
   - Requires Coolify API token

2. **Option B: Polling in Coolify**
   - Configure Coolify to periodically check for new images
   - Or manually trigger deployments from Coolify dashboard

3. **Option C: Use Latest Tag Pattern**
   - Coolify can watch for images matching a pattern
   - Example: `ghcr.io/OWNER/scholatempus-backend:main-*`

#### Registry Authentication

**For Public Repositories:**
- No authentication needed for pulling images
- GitHub Actions can push using `GITHUB_TOKEN`

**For Private Repositories:**
- Coolify needs a Personal Access Token with `read:packages` scope
- Create token: https://github.com/settings/tokens
- Add it in Coolify → Settings → Docker Registries

## Image Tag Strategy

The build process creates Docker images with the following tag format:

**Local builds (Coolify):**
```
scholatempus-backend:BRANCH-YYYYMMDD-HHMMSS
```

**Registry builds (GitHub Actions):**
```
ghcr.io/OWNER/scholatempus-backend:BRANCH-YYYYMMDD-HHMMSS
```

**Examples:**
- `ghcr.io/username/scholatempus-backend:main-20241215-143022`
- `ghcr.io/username/scholatempus-backend:dev-20241215-143022`
- `ghcr.io/username/scholatempus-backend:production-20241215-143022`

**Benefits:**
- Unique tags for every build (enables rollback to any previous version)
- Branch identification in tag name (easy to identify which branch was deployed)
- Timestamp provides chronological ordering
- No tag conflicts between branches or builds

## Build Script

The `build.sh` script:

1. Extracts the branch name from `GIT_BRANCH` environment variable (provided by Coolify)
2. Sanitizes the branch name (replaces `/` with `-` and removes special characters)
3. Generates a timestamp in format `YYYYMMDD-HHMMSS`
4. Constructs the image tag: `scholatempus-backend:BRANCH-TIMESTAMP`
5. Runs `encore build docker IMAGE:TAG` to build the Docker image

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `CLERK_SECRET_KEY` | Clerk authentication secret key | `sk_test_...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node.js environment | `production` |
| `PORT` | Application port | `4000` |
| `GIT_BRANCH` | Git branch name (auto-set by Coolify) | - |

## Database Setup

### Initial Setup

1. Create a PostgreSQL database on your server or use a managed database service
2. Ensure the database is accessible from your Coolify server
3. Set the `DATABASE_URL` environment variable in Coolify

### Running Migrations

Database migrations should be run before or during deployment. Options:

1. **Manual Migration**: Run migrations manually before deploying:
   ```bash
   cd backend
   pnpm db:migrate
   ```

2. **Migration Script**: Add a migration step to your build process:
   ```bash
   # In build.sh or Coolify build command
   pnpm install
   pnpm db:migrate
   ```

3. **Init Container**: Use an init container in Docker Compose to run migrations

## Troubleshooting

### Build Fails: Encore CLI Not Found

**Solution**: Install Encore CLI in the build command:
```bash
curl -L https://encore.dev/install.sh | bash
export PATH="$HOME/.encore/bin:$PATH"
./build.sh
```

### Build Fails: Permission Denied

**Solution**: Ensure `build.sh` is executable:
```bash
chmod +x build.sh
```

### Application Won't Start: Database Connection Error

**Solution**: 
1. Verify `DATABASE_URL` is correctly set in Coolify environment variables
2. Check database firewall rules allow connections from Coolify server
3. Verify database credentials are correct

### Application Won't Start: Clerk Authentication Error

**Solution**:
1. Verify `CLERK_SECRET_KEY` is correctly set
2. Check that the Clerk domain in `auth/config.ts` matches your Clerk configuration
3. Ensure `AUTHORIZED_PARTIES` in `auth/config.ts` includes your frontend URL

### Image Tag Issues

**Solution**: 
- Verify `GIT_BRANCH` environment variable is set by Coolify
- Check build logs to see what tag was generated
- Ensure branch name doesn't contain invalid characters (script sanitizes them)

### Registry Authentication Issues

**Problem**: Coolify can't pull images from private registry

**Solution**:
1. **For GHCR (private repos)**:
   - Create a GitHub Personal Access Token with `read:packages` scope
   - Add it in Coolify → Settings → Docker Registries
   - Registry URL: `ghcr.io`
   - Username: Your GitHub username
   - Password: Your Personal Access Token

2. **For Docker Hub**:
   - Use your Docker Hub username and access token
   - Add credentials in Coolify → Settings → Docker Registries

3. **Verify image exists**:
   - Check GitHub Packages page: `https://github.com/USERNAME?tab=packages`
   - Or use: `docker pull ghcr.io/OWNER/scholatempus-backend:TAG` to test

### Image Not Found in Registry

**Problem**: Coolify reports image not found

**Solution**:
1. Verify the image was pushed successfully in GitHub Actions logs
2. Check the exact image tag format matches what Coolify expects
3. For GHCR, ensure the repository visibility matches (public/private)
4. Wait a few seconds after push - registry propagation can take time
5. Verify the image tag exists: `docker pull ghcr.io/OWNER/scholatempus-backend:TAG`

## Monitoring

### Application Logs

View application logs in Coolify dashboard:
1. Navigate to your application
2. Click on **Logs** tab
3. Monitor for errors or warnings

### Health Checks

Configure health checks in Coolify to automatically restart the container if it becomes unhealthy.

## Rollback

To rollback to a previous version:

1. In Coolify, go to your application
2. Navigate to **Deployments** or **Images**
3. Find the previous image tag (e.g., `scholatempus-backend:main-20241215-120000`)
4. Redeploy using that image tag

## CI/CD Integration

### Automatic Deployments

Coolify can automatically deploy when code is pushed to specific branches:

1. In Coolify application settings, configure **Auto Deploy**
2. Select the branches that should trigger deployments
3. Push code to those branches to trigger automatic builds

### Manual Deployments

You can also trigger manual deployments from the Coolify dashboard or via API.

## Security Considerations

1. **Secrets Management**: Never commit secrets to the repository. Use Coolify's environment variables or Encore's secret management.

2. **Database Security**: 
   - Use strong database passwords
   - Restrict database access to only the Coolify server IP
   - Use SSL connections when possible

3. **Clerk Security**:
   - Keep Clerk secret keys secure
   - Rotate keys periodically
   - Use different keys for development and production

4. **Docker Image Security**:
   - Regularly update base images
   - Scan images for vulnerabilities
   - Use specific image tags (not `latest`) for production

## Additional Resources

- [Encore Self-Hosting Documentation](https://encore.dev/docs/ts/self-host/build)
- [Coolify Documentation](https://coolify.io/docs)
- [Encore Secrets Management](https://encore.dev/docs/ts/primitives/secrets)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Coolify and Encore documentation
3. Check application logs for error messages
4. Verify environment variables are correctly set

