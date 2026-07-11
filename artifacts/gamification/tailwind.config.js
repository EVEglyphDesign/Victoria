/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}", // includes the reflected JourneyPanel + engine
  ],
  theme: {
    extend: {
      colors: {
        // The panel references text-primary / bg-primary. Map to the EDU teal
        // token so the sphere-close visual matches the assessment wireframes.
        primary: "hsl(43 80% 57%)", // amber, matching the score ring accent
      },
    },
  },
  plugins: [],
};
