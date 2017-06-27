export const options = {
  valley_elevation: 0.5,
  noise_elevation: 0.5,
  speed: 0.4,
};

export const uniforms = {
  time:
  {
    type: 'f',
    value: 0.0,
  },
  speed:
  {
    type: 'f',
    value: options.speed,
  },
  valley_elevation:
  {
    type: 'f',
    value: options.valley_elevation,
  },
  noise_elevation:
  {
    type: 'f',
    value: options.noise_elevation,
  },
  offset:
  {
    type: 'f',
    value: options.valley_elevation,
  },
};
