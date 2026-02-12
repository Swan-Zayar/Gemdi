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
        keyframes: {
          disappear: {
            '0%': {
              opacity: '1',
              transform: 'scale(1) rotate(0deg)',
              filter: 'blur(0px)'
            },
            '50%': {
              opacity: '0.5',
              transform: 'scale(1.1) rotate(5deg)',
              filter: 'blur(1px)'
            },
            '100%': {
              opacity: '0',
              transform: 'scale(0.3) rotate(15deg)',
              filter: 'blur(8px)'
            },
          },
        },
        animation: {
          disappear: 'disappear 0.6s cubic-bezier(0.4, 0, 1, 1) forwards',
        },
      },
    },
    plugins: [],
  };
