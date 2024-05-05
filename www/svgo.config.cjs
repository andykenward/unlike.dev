/** @type {import("svgo").Config} */
const config = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
          removeTitle: false,
        },
      },
    },
    "prefixIds",
    "removeDimensions",
    {
      name: "addAttributesToSVGElement",
      params: {
        attributes: ['width="100%"', 'height="100%"', 'role="img"'],
      },
    },
  ],
};

module.exports = config;
