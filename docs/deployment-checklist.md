# Deployment Checklist for n8n Workflow GUI

This document ensures all features are accessible in the deployed application.

## ✅ Routes Created

All routes are properly set up and will be accessible in production:

### Frontend Routes
- ✅ `/dashboard/automations` - Main workflow management page
- ✅ `/dashboard` - Updated with "Workflows" navigation link

### API Routes
- ✅ `GET /api/automations/:workspaceId/automations/n8n/workflows` - List n8n workflows
- ✅ `POST /api/automations/:workspaceId/automations/n8n/workflows/:workflowId/trigger` - Trigger workflow directly
- ✅ `POST /api/automations/:workspaceId/automations/:automationId/trigger` - Trigger registered automation
- ✅ `GET /api/automations/:workspaceId/automations` - List saved automations
- ✅ `GET /api/workspaces` - List user workspaces (for workspace selector)

## 🔧 Environment Variables Required

Set these in your deployment environment:

### Required for Backend (API)
- `N8N_BASE_URL` - Base URL of your n8n instance (e.g., `https://n8n.example.com`)
- `N8N_API_KEY` - API key for n8n authentication

### Required for Frontend (Next.js)
- `NEXT_PUBLIC_N8N_BASE_URL` - Public URL to n8n instance (for opening workflows in editor)
- `NEXT_PUBLIC_API_URL` - Base URL of your API (e.g., `https://api.example.com` or `http://localhost:4000`)
- `NEXT_PUBLIC_DEMO_WORKSPACE_ID` - (Optional) Default workspace ID for demo/testing

### Notes
- `NEXT_PUBLIC_*` variables are exposed to the browser and must be set at build time
- The app will work without `NEXT_PUBLIC_DEMO_WORKSPACE_ID` - users can select workspaces dynamically
- The app will work without `NEXT_PUBLIC_N8N_BASE_URL` - the "Open n8n Editor" button will be hidden

## 📦 Build Verification

The following files are included in the build:

### Components
- ✅ `apps/web/src/components/dashboard/workflow-list.tsx`
- ✅ `apps/web/src/components/dashboard/workflow-card.tsx`

### Pages
- ✅ `apps/web/app/dashboard/automations/page.tsx`

### API Routes
- ✅ `apps/web/app/api/automations/[workspaceId]/automations/n8n/workflows/route.ts`
- ✅ `apps/web/app/api/automations/[workspaceId]/automations/n8n/workflows/[workflowId]/trigger/route.ts`

## 🚀 Deployment Steps

1. **Set Environment Variables**
   ```bash
   # In your deployment platform (Vercel, Railway, etc.)
   N8N_BASE_URL=https://your-n8n-instance.com
   N8N_API_KEY=your-api-key
   NEXT_PUBLIC_N8N_BASE_URL=https://your-n8n-instance.com
   NEXT_PUBLIC_API_URL=https://your-api-url.com
   ```

2. **Build the Application**
   ```bash
   pnpm --filter @scheduler/web build
   ```

3. **Verify Routes**
   - Navigate to `/dashboard/automations` after deployment
   - Verify workspace selector appears
   - Verify workflows load from n8n
   - Test triggering a workflow

## ✨ Features Available in Production

- ✅ **View all n8n workflows** - Lists active and inactive workflows
- ✅ **Workspace selection** - Dynamic workspace selector (no hardcoded workspace needed)
- ✅ **Trigger workflows** - Direct triggering via API (no registration required)
- ✅ **Open in n8n editor** - Direct links to edit workflows
- ✅ **Error handling** - Graceful error messages for missing config
- ✅ **Loading states** - Proper loading indicators
- ✅ **API compatibility** - All existing APIs remain functional

## 🔍 Testing Checklist

After deployment, verify:

- [ ] `/dashboard/automations` page loads
- [ ] Workspace selector appears and works
- [ ] Workflows are fetched from n8n
- [ ] Workflow cards display correctly
- [ ] Trigger button works for workflows
- [ ] "Open n8n Editor" button works (if `NEXT_PUBLIC_N8N_BASE_URL` is set)
- [ ] Error messages display correctly if n8n is not configured
- [ ] Navigation link from `/dashboard` works
- [ ] Back link to dashboard works

## 📝 Notes

- The GUI works independently of the APIs - both can be used simultaneously
- Users can trigger workflows directly without registering them as automations
- The page gracefully handles missing configuration
- All routes follow Next.js App Router conventions and will be included in the build
