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
        attributes: ['width="1em"', 'height="1em"', 'role="img"'],
      },
    },
  ],
};

module.exports = config;
