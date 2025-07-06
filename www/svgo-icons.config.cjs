/** @type {import("svgo").Config} */
const config = {
  plugins: [
    "preset-default",
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
