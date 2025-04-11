This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Client-side PDF Generation

The application now supports client-side PDF generation using the `@react-pdf/renderer` library. This feature provides:

- Perfectly matched styling with the UI dashboard
- Accurate visualizations in the PDF output
- Consistent rendering across different devices
- Better control over the PDF content and layout

### How it works

1. When a user clicks "Download PDF" in the dashboard, the app sends a request to the `/api/pdf` endpoint
2. The endpoint fetches the meeting analysis data from the backend
3. It then uses `@react-pdf/renderer` to generate a PDF that matches the dashboard UI
4. The PDF is streamed back to the browser for download

### Implementation Details

- `src/components/pdf/MeetingPDF.tsx` - React component that defines the PDF layout and styling
- `src/app/api/pdf/route.ts` - API route that handles the PDF generation request
- Updated `handleDownloadPdf` function in `src/app/dashboard/page.tsx` to use the new endpoint

### Features

- Consistent styling with the dashboard UI
- All metrics sections included (Sentiment, Participation, Speakers, Topics, etc.)
- Progress bars and visualizations for key metrics
- Proper handling of all data types including emojis for reactions
- Automatic page breaks for lengthy reports

This approach replaces the previous backend-based PDF generation to ensure visual consistency.
