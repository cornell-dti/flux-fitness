type InputFields = {
  [key: string]: {
    label: string;
    count: string;
    help?: { info: string; show: boolean };
  };
};

export default InputFields;
