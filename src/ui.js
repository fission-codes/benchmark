export const renderMeasurements = () => {
  const measures = performance.getEntriesByType("measure");
  measures.forEach((measureItem) => {
    console.log(`${measureItem.name}: ${measureItem.duration}`);
  });
};

export const showIds = (...ids) => {
  ids.forEach((id) => {
    document.getElementById(id).style.display = "flex";
  });
};

export const hideIds = (...ids) => {
  ids.forEach((id) => {
    document.getElementById(id).style.display = "none";
  });
};
