export default {
    darkMode: 'class',
    content: [
      "./index.html",
      "./*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        zIndex: {
          '1001': '1001',
          '1002': '1002',
          '1003': '1003',
        },
      },
    },
    plugins: [],
  };
