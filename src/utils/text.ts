export const getFormattedNames = (names: string[]) => {
    switch (names.length) {
        case 0:
            return '';
        case 1:
            return `${names[0]}`;
        default:
            // Example: "Alice, Bob and Carol"
            return names.slice(0, names.length - 1).join(', ') + ' and ' + names[names.length - 1];
    }
}
