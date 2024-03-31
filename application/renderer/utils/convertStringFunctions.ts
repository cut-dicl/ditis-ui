export const convertToTitleCase = (inputString: String) => {
  // Split the input string by capital letters
  const words = inputString.split(/(?=[A-Z])/);

  // Capitalize the first letter of each word and join them with a space
  return words
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

export const convertUnderlineToTitleCase = (inputString: String) => {
  // Split the input string by capital letters

  const words = inputString.replaceAll("_", " ").toLowerCase().split(" ");
  return words
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

export const convertToLabel = (keyString: string, stepData: string): string => {
  const lengthCorrection: 0 | 1 = stepData.includes("-") ? 1 : 0;
  const splitString = keyString
    .split(".")
    .slice(stepData.split(" ").length - lengthCorrection);
  splitString[0] =
    splitString[0].charAt(0).toUpperCase() +
    splitString[0].slice(1).toLowerCase();
  return splitString.join(" ");
};

export const convertDate = (row: any) => {
  const d = new Date(row.date * 1000);
  let hours: number | string = d.getHours();
  let minutes: number | string = d.getMinutes();
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return `${d.toLocaleDateString("en-UK")}`;
};

export const convertDotToTitleCase = (inputString: String) => {
  // Split the input string by capital letters
  const words = inputString.split(".");
  return words
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};
