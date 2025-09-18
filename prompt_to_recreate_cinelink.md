## App Name: CineLink

### Core Concept
CineLink is a web application that allows users to identify a movie by providing either a text description of a scene/plot or a link to a YouTube clip. The app uses AI to analyze the input, identify the movie, and display its details, including the poster, a summary, and links to purchase or rent it. It also maintains a history of previously identified movies.

---

### **1. Style and Theming Guidelines**

The application should have a modern, dark, cinematic theme.

-   **Font:** Use 'Space Grotesk' for all text (headings and body).
-   **Color Palette (Dark Theme):**
    -   **Background (`--background`):** Very dark blue, almost black (`#222831` or `hsl(222 24% 13%)`).
    -   **Card Background (`--card`):** Dark blue (`#30475E` or `hsl(211 32% 28%)`).
    -   **Primary Action Color (`--primary`):** A slightly lighter dark blue to stand out (`hsl(211 32% 40%)`).
    -   **Accent & Ring Color (`--accent`, `--ring`):** Silver/light gray (`#C8C6C6` or `hsl(0 0% 78%)`).
    -   **Muted Foreground (`--muted-foreground`):** Use the silver/light gray accent color (`#C8C6C6` or `hsl(0 0% 78%)`).
    -   **Default Text (`--foreground`):** A light, off-white color (`hsl(210 40% 98%)`).
-   **File to Modify:** These styles should be implemented by updating the HSL CSS variables within the `.dark` class in `src/app/globals.css`.

---

### **2. AI Functionality (Genkit Flows)**

Two separate AI flows are required, both using Genkit and a Gemini model.

**Common Output Schema:** Both flows must return a Zod object with this structure:
```typescript
const OutputSchema = z.object({
  movieFound: z.boolean(),
  movieTitle: z.string(),
  movieDetails: z.string(), // Release year and a one-sentence summary
  tmdbPosterPath: z.string(), // The path only, e.g., /q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg
  purchaseLinks: z.array(z.object({ service: z.string(), url: z.string().url() }))
});
```

**Flow 1: Identify from Description (`src/ai/flows/identify-movie-from-description.ts`)**
-   **Input:** A text description of a movie.
-   **Prompt Instructions:** Instruct the AI to act as a movie expert. It must analyze the text to identify the movie, return the title, a brief summary with the year, find the poster path from The Movie Database (TMDb), and provide at least two links to buy/rent it.

**Flow 2: Identify from YouTube Clip (`src/ai/flows/identify-movie-from-youtube-clip.ts`)**
-   **Input:** A YouTube URL.
-   **Prompt Instructions:** Instruct the AI to analyze the video content (scenes, dialogue, characters) to identify the movie. It should use the `{{media url=youtubeUrl}}` Handlebars helper. The required output is the same as the description flow: title, summary, TMDb poster path, and purchase links.

---

### **3. Backend: Server Action (`src/app/actions.ts`)**

A single server action, `identifyMovieAction`, will handle form submissions.

-   **Input:** `FormData` from the client.
-   **Logic:**
    1.  Determine the input type ('youtube' or 'description') from the form data.
    2.  Validate the corresponding input (URL or description text) using Zod. Return a specific error message if validation fails.
    3.  Call the appropriate AI flow based on the input type.
    4.  **Crucially, construct the full poster URL.** After receiving the `tmdbPosterPath` from the AI, prepend it with `https://image.tmdb.org/t/p/w500`.
    5.  Return a success object containing the AI data (with the full poster URL) or a failure object with an error message.

---

### **4. Frontend Components & Layout**

**A. `src/app/page.tsx` (Main Page)**
-   **Layout:** Centered vertically and horizontally.
-   **Header:**
    -   `<h1>` with the text "CineLink". Style it to be large and bold (`text-6xl`).
    -   A `<p>` tag below with the subtitle: "Identify any movie from a description or a YouTube clip."
-   **Main Component:** Render the `CineLinkMain` component below the header.

**B. `src/components/cine-link-main.tsx` (Core UI)**
-   **State Management:** Use `useState` to manage `isLoading`, `currentMovie` (the result), `movieNotFound` status, `history`, and the `activeTab`.
-   **History:** Use `localStorage` to persist the `history` array across sessions.
-   **Input Form:**
    -   Use ShadCN's `Tabs` component for "YouTube Link" and "Describe" inputs.
    -   The "YouTube Link" tab should contain a single `Input` for the URL.
    -   The "Describe" tab should contain a `Textarea`.
    -   A single "Identify Movie" `Button` submits the form. The button should show a `Loader2` icon and be disabled when `isLoading` is true.
-   **Disclaimer:** Add a small `<p>` tag with `text-xs` styling below the form that says "Disclaimer: Our AI detection may not always be correct."
-   **Results Area:**
    -   This entire section should only be rendered if `isLoading`, `currentMovie`, or `movieNotFound` is true. This prevents a large empty space on initial load.
    -   **Loading State:** When `isLoading`, display a centered `Loader2` icon with the text "Analyzing... this may take a moment."
    -   **Movie Found State:** If `currentMovie` is not null, render a featured `MovieCard` component, passing the movie data and an `isFeatured={true}` prop.
    -   **Not Found State:** If `movieNotFound` is true, display a `SearchX` icon with the text "Could not identify a movie. Please try being more specific or use a different clip."
-   **History Section:**
    -   Render this section only if `history.length > 0`.
    -   Display a heading "Your History" with a `History` icon.
    -   Use a `grid` layout to display a list of `MovieCard` components for each item in the history array. These cards should *not* have the `isFeatured` prop.

**C. `src/components/movie-card.tsx` (Movie Display)**
This component must have two variants based on the `isFeatured` prop.

-   **Featured Card (`isFeatured={true}`):**
    -   A two-column layout on medium screens and up (`md:grid-cols-2`).
    -   **Left Column:** An `Image` component displaying the movie poster with an aspect ratio of `2/3`. If no valid poster URL exists, show a placeholder with a `Clapperboard` icon.
    -   **Right Column:**
        -   `CardTitle`: The movie title, large (`text-3xl`).
        -   `CardDescription`: The movie details (summary and year).
        -   `CardFooter`: A "Where to Watch" section with `Button` links for each purchase option. Each button should have a `ShoppingCart` icon. This section should only render if `purchaseLinks` exist.
-   **History Card (`isFeatured={false}`):**
    -   A more compact, single-column vertical layout.
    -   An `Image` component at the top with a `2/3` aspect ratio. On hover, the image should scale up slightly (`group-hover:scale-105`).
    -   `CardTitle`: Smaller movie title (`text-lg`).
    -   `CardDescription`: Movie details, truncated to 2 lines (`line-clamp-2`).
    -   `CardFooter`: A compact "Where to Watch" section with smaller buttons for purchase links. This should only render if `purchaseLinks` exist.

---

### **5. Dependencies & Configuration**

-   **`package.json`:** Ensure `lucide-react`, `zod`, `@radix-ui/react-tabs`, and other ShadCN dependencies are included.
-   **`next.config.ts`:** Add `image.tmdb.org` to the `remotePatterns` in the `images` configuration to allow movie posters to be displayed.
-   **`tailwind.config.ts`:** Define the `Space Grotesk` font for the `body` and `headline` font families.
