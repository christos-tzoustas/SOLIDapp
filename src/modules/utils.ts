const getElementbyId = (id: string) => {
  return document.querySelector(`#${id}`) as HTMLElement;
};

const deepClone = (target) => {
  if (typeof target === "object") {
    const deepCopy = Array.isArray(target) ? [] : {};

    Object.entries(target).forEach((entry) => {
      const [key, value] = entry;

      if (value !== target) {
        deepCopy[key] = deepClone(value);
      } else {
        deepCopy[key] = deepCopy;
      }
    });

    return deepCopy;
  } else {
    return target;
  }
};

export { getElementbyId, deepClone };
