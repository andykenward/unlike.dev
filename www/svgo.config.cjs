/** @type {import("svgo").Config} */
const config = {
  plugins: [
    "preset-default",
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
