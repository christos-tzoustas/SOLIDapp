const getElementbyId = (id: string) => {
  return document.querySelector(`#${id}`) as HTMLElement;
};

export { getElementbyId };
