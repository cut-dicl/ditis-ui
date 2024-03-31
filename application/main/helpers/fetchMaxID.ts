const fetchMaxID = (confList): number => {
  const allIds = confList.configurations.map((object) => {
    return object.id;
  });

  return allIds.length > 0 ? Math.max(...allIds) + 1 : 1;
};

export { fetchMaxID };
