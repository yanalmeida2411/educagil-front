module.exports = {
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        xl: '1440px', 
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
       fontSize: {
        "2xs": "0.625rem", // 10px
        sm: "0.875rem", // 14px   (0.875 * 16)
        base: "1rem", // 16px   (1 * 16)
        lg: "1.125rem", // 18px   (1.125 * 16)
        xl: "1.25rem", // 20px   (1.25 * 16) 
        "2xl": "1.75rem", // 28px   (1.75 * 16)
        "3xl": "1.875rem", // 30px   (1.875 * 16)
        "4xl": "2.25rem", // 36px   (2.25 * 16)
      },
      container: {
        center: true,
        padding: "1rem",
        screens: {
          xs: "320px",
          smp: "375px",
          sm: "480px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1440px",
        },
      },
    },
  },
};