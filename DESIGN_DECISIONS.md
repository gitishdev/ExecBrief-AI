# ExecBrief AI - Design Decisions & Technical Considerations

This document captures key architectural and design decisions made during the development of ExecBrief AI to ensure performance, scalability, and a seamless user experience.

## 1. PDF Export Optimization

**Challenge:** 
Initial PDF exports were excessively large (ranging from 15MB to 20MB), despite containing primarily text data. 

**Root Cause:**
Because the app runs in an embedded iframe environment, the browser's native "Save as PDF" dialog is often blocked or behaves unpredictably. To bypass this and guarantee a perfect download, the app takes a high-resolution "screenshot" of the DOM and embeds that image into a PDF wrapper. Initially, this process used a lossless **PNG** format at 2x retina resolution. A full-page retina PNG is massive, causing the file size to balloon.

**Solution:**
The rendering engine was updated to use highly optimized **JPEG compression** (at 85% quality) instead of lossless PNG. 

**Result:**
This change drastically reduced the PDF file size from ~20MB down to **less than 1MB**, while keeping the text perfectly crisp and readable for executives.

## 2. Serverless Shareable Links

To allow users to share generated summaries without requiring a backend database to store the data, we implemented a stateless, URL-based sharing mechanism.

### URL Compression
When a user clicks the "Copy Link" button, the app takes the source video URL and the entire generated markdown summary, and compresses it heavily using **lz-string** (Lempel-Ziv compression). It then encodes this compressed data into a URL-safe token. This ensures the link works perfectly and contains the full state of the summary without needing any backend storage infrastructure.

### Instant Viewing
When someone visits the generated share link, the app instantly decodes the URL parameter and displays the executive summary. This happens entirely on the client side, meaning **no API calls are made to regenerate the content**. Furthermore, the app automatically saves this decoded summary to the visitor's local storage, ensuring they have it cached for future visits.

### Clean URL UX
To maintain a polished user experience, once the shared summary is loaded and parsed, the app automatically cleans up the long token from the browser's address bar. This leaves a neat, clean URL while preserving the content on the screen.
