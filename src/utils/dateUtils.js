const DATE_REGEX = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

export function isValidDate(date) {
    return DATE_REGEX.test(date);
}