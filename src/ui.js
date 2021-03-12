export const renderMeasurements = () => {
  const measures = performance.getEntriesByType("measure");
  let output = "";
  measures.forEach((measureItem) => {
    output += `${measureItem.name}: ${measureItem.duration} ms\n`;
  });

  setContent("performance", output);
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

export const setContent = (id, value) => {
  document.getElementById(id).innerHTML = value;
};

export const showError = (err) => {
  console.error(err);
  setContent("error-message", err.message);
  showIds("error");
  setClickHandler("error-close", () => {
    hideIds("error")
  })
};

export const setClickHandler = (id, callback) => {
  document.getElementById(id).onclick = callback;
};
