const sortQuestionColumns = columns => {
  return Object.entries(columns)
    .sort((a, b) => a[0].slice(-1) - b[0].slice(-1))
    .reduce((accumulator, [k, v]) => ({ ...accumulator, [k]: v }), {});
};

export { sortQuestionColumns };
