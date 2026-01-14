# Meeting Cost Calculator

A modern web application that calculates the real-time cost of meetings based on attendee salaries and hourly rates.

## Features

### Core Functionality
- **Real-time cost tracking** - Watch meeting costs accumulate every second
- **Multiple attendees** - Add unlimited participants with individual rates
- **AI salary estimation** - Use Claude AI to estimate salaries based on job title, location, and experience
- **Manual entry** - Enter annual salary or hourly rate directly
- **Overhead multiplier** - Account for benefits, taxes, and office costs (default 1.5x)

### Smart Features
- **Meeting templates** - Save and reuse common meeting configurations
- **Meeting history** - Track past meetings with detailed analytics
- **Cost comparisons** - See how meeting costs compare to real-world items
- **Meeting grades** - Get efficiency scores (A-F) based on duration, attendees, and cost
- **Keyboard shortcuts** - Space to start/pause, R to reset, Esc to close modals
- **Auto-save** - All data persists in browser localStorage

### Visual Feedback
- **Color-coded costs** - Green ($0-100), Yellow ($100-500), Orange ($500-1000), Red ($1000+)
- **Animated counters** - Smooth number transitions and pulsing effects
- **Cost benchmarks** - Visual progress bars comparing to team lunch, SaaS subscriptions, etc.
- **Dark mode** - Full dark mode support with auto-detection

### Export & Sharing
- **Share summary** - Copy formatted text for Slack/Teams/Email
- **Meeting insights** - Post-meeting analysis with efficiency suggestions
- **Cost projections** - Calculate annual costs for recurring meetings

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Claude AI** - Salary estimation via Anthropic API
- **OpenNext Cloudflare** - Edge deployment

## Environment Variables

To enable AI salary estimation, add your Anthropic API key:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Deploy to Cloudflare
pnpm deploy
```

## Usage

1. **Add Attendees** - Click "Add Attendee" and either:
   - Enter salary/hourly rate manually
   - Use AI estimation with job title and location

2. **Start Meeting** - Click "Start Meeting" to begin tracking

3. **Monitor Costs** - Watch the real-time cost accumulate

4. **End Meeting** - Pause and click "End & Summary" to see insights

5. **Review History** - Access past meetings from the history icon

## Keyboard Shortcuts

- `Space` - Start/Pause/Resume meeting
- `R` - Reset meeting (with confirmation)
- `Esc` - Close open modals

## Features in Detail

### AI Salary Estimation
Provide job details and get market-rate salary estimates:
- Job title (e.g., "Senior Software Engineer")
- Location (e.g., "San Francisco, CA")
- Experience level (Entry/Mid/Senior/Lead)
- Company size (Startup to Enterprise)
- Industry (Tech, Finance, Healthcare, etc.)

Returns median salary with confidence level and typical range.

### Meeting Insights
After ending a meeting, get:
- Efficiency grade (A-F)
- Cost comparisons (hours of junior dev work, team lunches, etc.)
- Suggestions ("This could have been an email", "Consider fewer attendees")
- Cost per minute breakdown

### Templates
Save common meeting configurations:
- All attendees with their rates
- Overhead multiplier setting
- Quick-load for recurring meetings

## License

MIT

