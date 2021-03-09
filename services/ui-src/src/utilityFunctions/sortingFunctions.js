const sortQuestionColumns = columnArray => {
  let sortedColumns = columnArray.map(singleRow =>
    Object.entries(singleRow)
      .sort((a, b) => a[0].slice(-1) - b[0].slice(-1))
      .reduce((accumulator, [k, v]) => ({ ...accumulator, [k]: v }), {})
  );
  return sortedColumns;
};

export { sortQuestionColumns };
