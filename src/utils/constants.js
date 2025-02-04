export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201
};

export const sendResponse = (res, status, data) => res.status(status).json(data);

export const formatMessage = (message) => {
    const parts = message.split(" | Details: ");
    let formattedMessage = parts[0];

    if (parts[1]) {
        const details = JSON.parse(parts[1]);
        formattedMessage += ` Path  ${details.path} Method ${details.method} IP ${details.ip}`;

        if (details.body && Object.keys(details.body).length) {
            formattedMessage += ` Body ${formatBody(details.body)}`;
        }
    }

    return formattedMessage;
};

const formatBody = (body) => {
    return Object.entries(body)
        .map(([key, value]) => ` ${key}: ${typeof value === "object" ? JSON.stringify(value, null, 2) : value}`)
        .join(",");
};
const DATE_REGEX = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

export function isValidDate(date) {
    return DATE_REGEX.test(date);
}