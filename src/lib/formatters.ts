const CURRENCY_FORMATTER = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
});

export function formatCurrency(amount: number) {
    return CURRENCY_FORMATTER.format(amount);
}

const NUMBER_FORMATTER = new Intl.NumberFormat('fr-FR');

export function formatNumber(number: number) {
    return NUMBER_FORMATTER.format(number);
}
