# PulsePoint - Meeting Sentiment Analysis

## Introduction

PulsePoint is an AI-powered meeting analytics platform that helps teams understand the emotional dynamics of their meetings. The application provides real-time insights into participant sentiment, engagement levels, and communication patterns during meetings.

The platform analyzes various aspects of meetings including speaker sentiment, topic relevance, engagement gaps, and communication patterns to provide actionable insights that can help improve meeting effectiveness.

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **UI Components**: shadcn/ui component library
- **Styling**: Tailwind CSS
- **Charts**: Recharts with shadcn/ui chart components
- **Date Handling**: date-fns
- **Icons**: Lucide React

## Project Structure

The application follows the Next.js App Router structure:

- `/app`: Contains the main pages of the application
  - `/dashboard`: Main dashboard view
  - `/live-analysis`: Real-time meeting analysis
  - `/meetings`: Archive of past meetings
  - `/settings`: Application settings
- `/components`: Reusable UI components organized by feature
  - `/analysis`: Components for analyzing meeting data
  - `/dashboard`: Dashboard-specific components
  - `/insights`: Components for displaying AI-generated insights
  - `/meetings`: Meeting-related components
  - `/modals`: Modal dialog components
  - `/ui`: shadcn/ui base components

## Pages and Their Functions

### 1. Dashboard (`/app/dashboard/page.tsx`)

The dashboard provides an overview of the current meeting in progress, displaying:

- Real-time sentiment and engagement metrics
- Current speaker information
- Meeting duration
- Live meeting sentiment and engagement charts
- Meeting participation statistics
- Speaker analysis
- Topic analysis
- Reaction analysis

The dashboard includes buttons to connect to a meeting or end the current meeting, which trigger modal dialogs.

### 2. Live Analysis (`/app/live-analysis/page.tsx`)

This page focuses on real-time analysis of an ongoing meeting:

- Live transcript with speaker identification
- Real-time sentiment analysis
- AI-generated insights
- Question analysis
- Meeting summary with tabs for overview, action items, and insights

This page is designed for users who want to monitor a meeting as it happens and get immediate insights.

### 3. Archive (`/app/meetings/page.tsx`)

The archive page allows users to browse and analyze past meetings with several views:

- **List View**: Displays a table of past meetings with filtering options
- **Trends**: Shows sentiment and engagement trends across meetings
- **Analytics**: Detailed analytics for a selected meeting including:
  - Sentiment and engagement metrics
  - Speaker analysis
  - Topic analysis
  - Participation statistics
  - Reaction analysis
- **AI Insights**: AI-generated insights about the meeting including:
  - Meeting summary
  - Speaker effectiveness analysis
  - Communication patterns
  - Question analysis
  - Engagement gaps
- **Meeting Details**: Focused view of meeting details including:
  - Meeting metadata (date, duration, platform)
  - Overview information
  - Speaker analysis

### 4. Settings (`/app/settings/page.tsx`)

The settings page allows users to configure the application with tabs for:

- **General**: Company name, admin email, dark mode, notifications
- **Integrations**: Connect to survey platforms and meeting platforms
- **Alerts**: Configure alert thresholds and recipients

## Key Components and Their Functions

### Analysis Components

1. **LiveSentimentAnalysis**: Displays real-time sentiment scores with trend indicators and recent reactions.

2. **LiveSpeakerAnalysis**: Shows sentiment and engagement metrics for all speakers in a meeting.

3. **LiveTopicAnalysis**: Visualizes the topics being discussed and their sentiment scores.

4. **LiveTranscript**: Displays a real-time transcript of the meeting with speaker identification.

5. **QuestionAnalysis**: Analyzes questions asked during meetings, categorizing them and showing their sentiment impact.

6. **EngagementGaps**: Identifies periods with low engagement during meetings.

### Meeting Components

1. **MeetingParticipationStats**: Visualizes participation statistics for a meeting.

2. **MeetingSentimentTrends**: Charts sentiment and engagement trends over time.

3. **SpeakerSentimentComparison**: Compares sentiment scores across different speakers.

4. **SpeakerTopics**: Shows the topics discussed by each speaker.

5. **PastMeetingsView**: Displays a list of past meetings with filtering options.

6. **MeetingDetailView**: Shows detailed information about a specific meeting.

### Insight Components

1. **MeetingAIInsights**: Provides AI-generated insights about a meeting.

2. **SpeakerSentimentInsights**: Analyzes how speaker communication affects team sentiment.

3. **CommunicationPatterns**: Shows how different communication styles affect team sentiment.

4. **RecentInsights**: Displays recent AI-generated insights.

### Modal Components

1. **MeetingEndModal**: Dialog for ending a meeting and saving its data.

2. **ConnectMeetingModal**: Dialog for connecting to a meeting platform.

## Data Flow

1. **Real-time Meeting Data**:
   - Meeting platforms (Zoom, Microsoft Teams, Google Meet) provide real-time data
   - The application processes this data to extract sentiment, engagement, and other metrics
   - Results are displayed in the Dashboard and Live Analysis pages

2. **Historical Meeting Data**:
   - Past meeting data is stored and accessible through the Archive page
   - Users can select specific meetings to view detailed analytics and insights

3. **AI Insights**:
   - The application uses AI to analyze meeting data and generate insights
   - These insights are displayed in various components throughout the application

## Key Features

1. **Real-time Sentiment Analysis**: Analyzes the emotional tone of meeting participants in real-time.

2. **Speaker Analysis**: Tracks speaker effectiveness, sentiment, and engagement.

3. **Topic Analysis**: Identifies and analyzes the topics discussed during meetings.

4. **Engagement Tracking**: Monitors participant engagement and identifies engagement gaps.

5. **Question Analysis**: Analyzes questions asked during meetings and their impact.

6. **Communication Pattern Analysis**: Identifies effective and ineffective communication patterns.

7. **Meeting Summaries**: Generates AI-powered summaries of meetings.

8. **Historical Trends**: Tracks sentiment and engagement trends over time.

## Setup and Installation

1. **Prerequisites**:
   - Node.js 18 or later
   - npm or yarn

2. **Set up**:

git clone `<repository-url>`
cd meeting-sentiment-analysis
npm install

3. **Environment Variables**:
Create a `.env.local` file with the following variables:

NEXT_PUBLIC_APP_URL=[http://localhost:3000](http://localhost:3000)


4. **Running the Application**:
npm run dev

The application will be available at http://localhost:3000

## Usage Instructions

1. **Connecting to a Meeting**:
- Click "Connect to Meeting" on the Dashboard
- Select your meeting platform (Zoom, Microsoft Teams, Google Meet)
- Enter the meeting link or ID
- Click "Connect"

2. **Viewing Live Analysis**:
- Navigate to the Live Analysis page
- View real-time transcript, sentiment, and insights
- Monitor questions and engagement

3. **Ending a Meeting**:
- Click "End Meeting" on the Dashboard
- Enter a meeting title if needed
- Click "Save & End Meeting"

4. **Analyzing Past Meetings**:
- Navigate to the Archive page
- Select a meeting from the dropdown or list
- Explore different tabs (Analytics, AI Insights, Meeting Details)
- Generate reports as needed

5. **Configuring Settings**:
- Navigate to the Settings page
- Configure general settings, integrations, and alerts
- Connect to meeting platforms and survey tools

## Component Relationships

The application uses a hierarchical component structure:

1. **Page Components**: Top-level components that define each page
- These import and compose various feature components

2. **Feature Components**: Components that implement specific features
- These may use multiple UI components and other feature components

3. **UI Components**: Base components from shadcn/ui
- These are used throughout the application for consistent styling

Components communicate through props and context where appropriate. The application uses React's component composition pattern extensively to create complex UIs from simpler components.

## Data Visualization

The application uses several types of charts to visualize meeting data:

1. **Line Charts**: For sentiment and engagement trends over time
2. **Bar Charts**: For comparing sentiment across speakers or topics
3. **Pie Charts**: For topic distribution
4. **Progress Bars**: For simple metric visualization

All charts use a consistent color scheme and styling for a cohesive user experience.

## Accessibility Features

The application includes several accessibility features:

1. **Semantic HTML**: Using appropriate HTML elements for their intended purpose
2. **ARIA attributes**: Adding aria-* attributes where needed
3. **Keyboard navigation**: Ensuring all interactive elements are keyboard accessible
4. **Color contrast**: Maintaining sufficient contrast for text and UI elements
5. **Screen reader support**: Adding descriptive text for screen readers

## Conclusion

PulsePoint is a comprehensive meeting analytics platform that helps teams understand and improve their meeting dynamics. By analyzing sentiment, engagement, and communication patterns, it provides actionable insights that can lead to more effective and productive meetings.

