export const roundValue = value => {
    if (value % 1 > 0) {
        return value.toFixed(1);
    }
    return value;
};
