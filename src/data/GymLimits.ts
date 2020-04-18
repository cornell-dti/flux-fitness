// TODO: move this to backend

/**
 * An object that holds the limits for each gym
 */
const GymLimits: {
  [key: string]: { cardio: number; other: number };
} = {
  teagle: {
    cardio: 42,
    other: 86
  },
  noyes: {
    cardio: 32,
    other: 40
  },
  "helen-newman": {
    cardio: 35,
    other: 51
  },
  appel: {
    cardio: 20,
    other: 40
  }
};

export default GymLimits;
