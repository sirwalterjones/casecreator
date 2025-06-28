# Case Creator - CMANS Case File Generator

A Next.js application for the Cherokee Multi-Agency Narcotics Squad (CMANS) that generates professional PDF case files from WordPress data sources.

## High-Level Architecture

### Technology Stack
- **Framework**: Next.js 14.2.23 (React 18 with App Router)
- **UI Framework**: Tailwind CSS with Shadcn/ui components
- **TypeScript**: Strict configuration for type safety
- **PDF Generation**: Multiple libraries (@react-pdf/renderer, jsPDF, pdf-lib)
- **Styling**: CSS-in-JS with Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Custom password protection system

### Application Structure
The application follows a 4-step wizard workflow:
1. **Source Selection** - Connect to WordPress site and select case categories
2. **Content Review** - Preview and select specific posts/reports  
3. **Document Customization** - Configure PDF formatting and branding
4. **File Generation** - Generate and download the professional PDF

### Key Features
- Password-protected access (`cmans600`)
- WordPress integration via REST API scraping
- Multi-step PDF generation with custom branding
- Default CMANS logo integration
- Responsive modern UI design
- Progress tracking throughout the workflow

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main application page
│   ├── globals.css        # Global styles and CSS variables
│   └── favicon.ico        # Site favicon
├── components/            # React components
│   ├── CategorySelector.tsx   # WordPress category selection
│   ├── PostPreview.tsx       # Content preview and selection
│   ├── PDFCustomizer.tsx     # PDF formatting options
│   ├── PDFGenerator.tsx      # PDF generation engine
│   ├── tempo-init.tsx        # Tempo development tools
│   └── ui/                   # Shadcn/ui component library
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── [40+ other components]
└── lib/
    └── utils.ts           # Utility functions (cn helper, etc.)

public/
└── images/
    └── cropped-newestcmanslogo.png  # Default CMANS logo

Root Configuration Files:
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration  
├── tsconfig.json          # TypeScript configuration
├── components.json        # Shadcn/ui configuration
├── tempo.config.json      # Tempo typography settings
└── package.json           # Dependencies and scripts
```

## Development Commands

### Essential Commands
```bash
# Development server
npm run dev                # Start development server on http://localhost:3000

# Production build
npm run build             # Build optimized production bundle
npm run start             # Start production server

# Code formatting
npx prettier --write .    # Format code using Prettier
```

### Development Workflow
```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build and test production
npm run build
npm run start
```

## Key Dependencies

### Core Framework
- `next`: Next.js framework (14.2.23)
- `react` & `react-dom`: React library (18)
- `typescript`: TypeScript support

### UI & Styling  
- `tailwindcss`: Utility-first CSS framework
- `@radix-ui/*`: Headless UI primitives (30+ packages)
- `lucide-react`: Icon library
- `class-variance-authority`: Component variant management
- `tailwind-merge`: Tailwind class merging utility

### PDF Generation
- `@react-pdf/renderer`: React-based PDF generation
- `jspdf`: JavaScript PDF generation
- `pdf-lib`: PDF manipulation library
- `html2canvas`: HTML to canvas conversion

### Data & Forms
- `react-hook-form`: Form state management
- `@supabase/supabase-js`: Database integration (latest)
- `react-day-picker`: Date picker component

### Development Tools
- `tempo-devtools`: Visual development enhancement
- `prettier`: Code formatting
- `autoprefixer`: CSS vendor prefixing

## Configuration Details

### Next.js Configuration (`next.config.js`)
- Image domains: `images.unsplash.com`
- Conditional Tempo integration for development
- SWC plugin configuration for different Next.js versions

### TypeScript Configuration  
- Strict mode enabled
- Path aliases: `@/*` → `./src/*`
- Next.js plugin integration
- ES2015+ target with modern module resolution

### Tailwind CSS
- Dark mode support via class strategy
- Custom color system with CSS variables
- Extended container and typography settings
- Animation utilities included

### Shadcn/ui Integration
- Default style with neutral base color
- RSC (React Server Components) support
- TypeScript enabled
- Custom component and utility aliases

## Special Setup Requirements

### Environment Setup
1. **Node.js**: Modern version supporting Next.js 14+
2. **Package Manager**: npm (package-lock.json present)
3. **Development**: Tempo tools for enhanced development experience

### Authentication
- Application uses hardcoded password protection (`cmans600`)
- No external authentication providers required
- Session managed via React state

### WordPress Integration
- Default target: `https://cmansrms.us`
- Scrapes WordPress REST API endpoints
- Parses HTML for category and post extraction
- No WordPress plugins required

### PDF Generation Requirements
- Multiple PDF libraries for different use cases
- Image processing capabilities via html2canvas
- Font and styling customization support
- Default CMANS branding integration

## Development Notes

### Code Organization
- Clean separation of concerns with dedicated components
- TypeScript interfaces for type safety
- Consistent file naming conventions
- Backup files present (indicating active development)

### UI/UX Patterns
- Step-by-step wizard interface
- Progressive disclosure of functionality
- Consistent design system via Shadcn/ui
- Responsive design with mobile considerations

### Performance Considerations
- Next.js App Router for optimal loading
- Component lazy loading where appropriate
- Efficient PDF generation with multiple fallback options
- Image optimization via Next.js

### Security Features
- Password protection for sensitive case data
- Client-side data processing (no server storage)
- Secure PDF generation without external API calls

## Getting Started

1. **Clone and Install**:
   ```bash
   git clone [repository]
   cd casecreator
   npm install
   ```

2. **Development**:
   ```bash
   npm run dev
   ```
   Access at `http://localhost:3000`

3. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

4. **Access Application**:
   - Password: `cmans600`
   - Default WordPress source: `https://cmansrms.us`

The application is designed for law enforcement case file generation with a focus on professional presentation and data security.