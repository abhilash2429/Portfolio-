# Portfolio Customization Instructions for Claude Opus 4.5

## Project Context

You are helping to customize a personal portfolio and blog application originally built for ayush.top. This is a Next.js 16 project with the following technology stack:

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Runtime & Package Manager:** npm
- **Styling:** Tailwind CSS, Shadcn UI
- **Content Management:** Velite (MDX processing)
- **State/Data:** TanStack Query, Zod
- **Animations:** Framer Motion
- **Icons:** Lucide React, React Icons

## Your Mission

Guide the user through a complete customization of this portfolio to make it their own. This includes:

1. **Personal Information & Branding**
2. **Content Migration** (blog posts, projects, etc.)
3. **Design Customization** (colors, fonts, layout)
4. **Feature Enhancements** (new features as requested)
5. **Deployment Setup**

## Phase 1: Initial Assessment & Setup Verification

### Step 1.1: Project Exploration
First, explore the current project structure to understand what we're working with:

```bash
# Check project structure
ls -la

# Verify package manager
cat package.json

# Check configuration files
cat src/config.ts
cat velite.config.ts
cat tailwind.config.ts
```

### Step 1.2: Environment Check
Verify the development environment is ready:

```bash
# Verify npm is installed
npm --version

# Install dependencies if needed
npm install

# Test the development server
npm run dev
```

**Ask the user:**
- Can you access the site at `http://localhost:3000`?
- Does everything load correctly?
- Take a screenshot if there are any errors.

## Phase 2: Gather User Information

Before making any changes, collect all necessary information from the user. Ask them to provide:

### Personal Information
1. **Full Name**
2. **Professional Title/Role** (e.g., "Full-Stack Developer", "Designer", "Student")
3. **Short Bio** (2-3 sentences)
4. **Location** (optional)
5. **Email Address**
6. **Profile Photo** (path or URL)

### Social Links
Ask which of these they want to include:
- GitHub username
- Twitter/X handle
- LinkedIn profile URL
- Instagram handle
- YouTube channel
- Personal website (if different)
- Other platforms (Discord, Dribbble, etc.)

### Brand Identity
1. **Preferred Color Scheme**
   - Primary color (hex code)
   - Secondary color (hex code)
   - Or choose from: Blue, Purple, Green, Orange, Red, Pink
2. **Preferred Theme**
   - Light mode default
   - Dark mode default
   - System preference
3. **Font Preferences** (optional)
   - Heading font
   - Body font

### Content Inventory
1. **Existing Blog Posts** (do they have any to migrate?)
2. **Projects to Showcase** (list with descriptions)
3. **Skills/Technologies** to highlight
4. **Work Experience** (optional)
5. **Education** (optional)

## Phase 3: Core Customization

### Step 3.1: Update Site Configuration

Edit `src/config.ts` with the user's information:

```typescript
// Example structure - adapt based on actual file
export const siteConfig = {
  name: "[User's Name]",
  title: "[User's Name] - [Professional Title]",
  description: "[User's Bio]",
  url: "https://[their-domain].com",
  author: {
    name: "[User's Name]",
    email: "[User's Email]",
    twitter: "@[username]",
  },
  links: {
    github: "https://github.com/[username]",
    twitter: "https://twitter.com/[username]",
    linkedin: "https://linkedin.com/in/[username]",
    // ... other links
  },
}
```

**Checklist:**
- [ ] Update name and title
- [ ] Update bio/description
- [ ] Update email
- [ ] Update all social links
- [ ] Remove any links user doesn't want
- [ ] Add any additional links user needs

### Step 3.2: Update Metadata & SEO

Update metadata in relevant layout files (typically `src/app/layout.tsx`):

```typescript
export const metadata: Metadata = {
  title: {
    default: "[User's Name]",
    template: `%s | [User's Name]`,
  },
  description: "[User's Bio]",
  keywords: ["[User's Skills]", "[User's Role]", "portfolio", "blog"],
  authors: [{ name: "[User's Name]" }],
  creator: "[User's Name]",
  // Update Open Graph and Twitter cards
}
```

### Step 3.3: Customize Theme Colors

Update `tailwind.config.ts` with user's preferred colors:

```typescript
// Find the theme configuration and update colors
theme: {
  extend: {
    colors: {
      primary: {
        // User's primary color shades
      },
      secondary: {
        // User's secondary color shades
      },
    },
  },
}
```

If the user chose a preset color, you can use Shadcn's theme generator approach.

### Step 3.4: Update Homepage Content

Edit the main page component (likely `src/app/page.tsx`):

- Update hero section with user's name and title
- Update bio section
- Update featured projects/posts
- Update call-to-action sections

### Step 3.5: Update About Page

If there's an about page (`src/app/about/page.tsx`):

- Replace content with user's detailed bio
- Add user's skills section
- Add work experience if provided
- Add education if provided
- Update any images

## Phase 4: Content Migration

### Step 4.1: Clear Existing Content

**Important:** First, backup existing content for reference:

```bash
# Create backup
cp -r src/content src/content.backup
```

Then clear out demo content:

```bash
# Remove existing posts
rm -rf src/content/posts/*
```

### Step 4.2: Create New Blog Posts

For each blog post the user wants to add, create a new MDX file in `src/content/posts/`:

```mdx
---
title: "[Post Title]"
slug: "[url-friendly-slug]"
description: "[Post Description]"
cover: "[path-to-cover-image]"
date: "2024-XX-XX"
published: true
tags: ["tag1", "tag2"]
---

[Post content in Markdown/MDX]
```

**Guide the user:**
1. Ask if they have existing blog posts to migrate
2. If yes, help convert them to MDX format
3. If no, create 1-2 sample posts to demonstrate the system
4. Show them how to add images to posts

### Step 4.3: Update Project Showcase

If there's a projects section:

1. Create project data structure
2. Add user's projects with:
   - Title
   - Description
   - Technologies used
   - GitHub link (if applicable)
   - Live demo link (if applicable)
   - Screenshots/images

## Phase 5: Visual Customization

### Step 5.1: Replace Images

Help user replace all placeholder images:

1. **Favicon & App Icons**
   - Update `public/favicon.ico`
   - Update app icons if present
   
2. **Profile Photo/Avatar**
   - Add user's photo to `public/` directory
   - Update references in components

3. **Blog Post Covers**
   - Add cover images for blog posts
   - Ensure consistent sizing

4. **Project Screenshots**
   - Add project thumbnails/screenshots

### Step 5.2: Typography Adjustments

If user has font preferences:

```typescript
// Update in tailwind.config.ts or globals.css
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })
```

### Step 5.3: Layout Refinements

Based on user preferences:
- Adjust spacing
- Modify navigation structure
- Customize footer content
- Update component styles

## Phase 6: Feature Enhancements

**Ask the user what additional features they want.** Common requests:

### Option A: Contact Form
- Integrate a contact form (with email service like Resend or FormSubmit)
- Add form validation with Zod
- Create success/error states

### Option B: Newsletter Subscription
- Add newsletter signup component
- Integrate with service (Mailchimp, ConvertKit, Buttondown)
- Add to homepage and/or blog posts

### Option C: Analytics
- Add analytics tracking (Vercel Analytics, Google Analytics, or Plausible)
- Track page views and user interactions
- Ensure GDPR compliance if needed

### Option D: Search Functionality
- Add blog post search
- Implement with Fuse.js or similar
- Add search UI component

### Option E: RSS Feed
- Generate RSS feed for blog posts
- Add RSS link to footer

### Option F: Comments System
- Integrate Giscus (GitHub Discussions)
- Or another commenting system
- Add to blog post template

### Option G: Portfolio Filtering
- Add filter/sort for projects
- Add tags/categories
- Create filter UI

### Option H: Reading Time & View Count
- Calculate reading time for posts
- Track view counts (with database or analytics)
- Display on blog post cards

**For each requested feature:**
1. Explain what's needed
2. Show code examples
3. Implement step-by-step
4. Test thoroughly
5. Get user confirmation

## Phase 7: Testing & Quality Assurance

### Step 7.1: Development Testing

```bash
# Run development server
npm run dev
```

**Test checklist:**
- [ ] All pages load without errors
- [ ] Navigation works correctly
- [ ] Links go to correct destinations
- [ ] Images load properly
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Dark/light mode toggle works
- [ ] Blog posts render correctly
- [ ] MDX components work
- [ ] Forms submit successfully (if applicable)

### Step 7.2: Build Testing

```bash
# Create production build
npm run build

# Test production build locally
npm run start
```

**Check for:**
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No build warnings
- [ ] All pages are generated
- [ ] Static assets are optimized

### Step 7.3: Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format
```

Fix any issues that arise.

## Phase 8: Deployment Preparation

### Step 8.1: Environment Variables

If the project uses any API keys or secrets:

1. Create `.env.local` for local development
2. Document all required environment variables
3. Provide instructions for setting them in production

### Step 8.2: Deployment Platform Selection

**Ask the user:** Where do you want to deploy?

**Option A: Vercel (Recommended for Next.js)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel
```

**Option B: Netlify**
- Connect GitHub repository
- Configure build settings
- Deploy

**Option C: Cloudflare Pages**
- Connect repository
- Set build command: `npm run build`
- Set output directory: `.next`

**Option D: Self-hosted**
- Provide Docker setup
- Or Node.js deployment guide

### Step 8.3: Domain Configuration

Help user:
1. Connect custom domain
2. Set up SSL certificate
3. Configure DNS records
4. Test domain propagation

## Phase 9: Documentation & Handoff

### Step 9.1: Create README

Update `README.md` with:

```markdown
# [User's Name] - Portfolio

## About
[User's bio]

## Tech Stack
[List of technologies]

## Development

### Prerequisites
- Node.js and npm installed

### Setup
\`\`\`bash
npm install
npm run dev
\`\`\`

### Build
\`\`\`bash
npm run build
\`\`\`

## Adding Content

### Blog Posts
[Instructions for adding new posts]

### Projects
[Instructions for adding new projects]

## Customization
[Notes on how to customize colors, fonts, etc.]

## Deployment
[Deployment instructions]

## License
[License information]
```

### Step 9.2: Create Content Guide

Create `CONTENT_GUIDE.md`:

```markdown
# Content Management Guide

## Adding a New Blog Post

1. Create a new file in `src/content/posts/` with the format `YYYY-MM-DD-post-title.mdx`
2. Add frontmatter:
   \`\`\`yaml
   ---
   title: "Your Post Title"
   slug: "your-post-title"
   description: "Post description"
   cover: "/images/covers/your-cover.jpg"
   date: "2024-XX-XX"
   published: true
   tags: ["tag1", "tag2"]
   ---
   \`\`\`
3. Write your content using Markdown/MDX
4. Save and the site will automatically rebuild

## Adding Images
[Instructions]

## Updating Personal Info
[Instructions]
```

### Step 9.3: Maintenance Tips

Provide guidance on:
- How to update dependencies safely
- Backup strategies
- Performance monitoring
- SEO best practices
- Content calendar suggestions

## Communication Guidelines for Claude

### Be Interactive
- Ask questions before making assumptions
- Show examples before implementing
- Get confirmation after each major change
- Offer choices when multiple approaches exist

### Be Educational
- Explain what each change does
- Share best practices
- Teach the user how to maintain the site
- Provide resources for learning more

### Be Thorough
- Check for errors after each step
- Test changes before moving on
- Document everything clearly
- Create fallback plans

### Be Adaptive
- Adjust pace based on user's technical level
- Simplify explanations for beginners
- Provide advanced options for experienced users
- Be patient with questions

## Workflow Summary

1. ✅ **Setup**: Verify environment and dependencies
2. 📋 **Gather**: Collect all user information and preferences
3. ⚙️ **Configure**: Update site configuration and metadata
4. 🎨 **Design**: Customize colors, fonts, and visual elements
5. 📝 **Content**: Migrate or create blog posts and projects
6. 🚀 **Features**: Add requested enhancements
7. 🧪 **Test**: Thoroughly test all functionality
8. 🌐 **Deploy**: Help with deployment setup
9. 📚 **Document**: Create guides for future maintenance

## Success Criteria

The customization is complete when:
- [ ] All user's personal information is updated
- [ ] Site reflects user's brand identity
- [ ] All content is migrated or created
- [ ] Requested features are implemented and working
- [ ] Site is thoroughly tested
- [ ] Site is deployed and accessible
- [ ] User has documentation for maintenance
- [ ] User is confident in managing the site

---

## Getting Started

**First Action:** Begin by greeting the user and starting Phase 1 - Initial Assessment. Explore the project structure and verify the development environment is working correctly. Then, move systematically through each phase, ensuring the user understands and approves each step before proceeding.

Remember: This is their portfolio. Make it uniquely theirs while maintaining code quality and best practices.

