// TODO: move this to backend

/**
 * An object that holds the limits for each gym
 */
const GymLimits: {
  [key: string]: { cardio: number; other: number };
} = {
  Teagle: {
    cardio: 42,
    other: 86
  },
  Noyes: {
    cardio: 32,
    other: 40
  },
  "Helen Newman": {
    cardio: 35,
    other: 51
  },
  Appel: {
    cardio: 20,
    other: 40
  }
};

export default GymLimits;
