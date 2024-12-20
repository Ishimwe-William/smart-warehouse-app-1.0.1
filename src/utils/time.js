
export const getTimeRange = (timeframe, customStartDate, customEndDate) => {

    const now = new Date();
    switch (timeframe) {
        case "1hr":
            return [new Date(now.getTime() - 60 * 60 * 1000), now];
        case "1day":
            return [new Date(now.getTime() - 24 * 60 * 60 * 1000), now];
        case "1week":
            return [new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now];
        case "1month":
            return [new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now];
        case "custom":
            return [customStartDate, customEndDate];
        default:
            return [new Date(0), now];
    }
};