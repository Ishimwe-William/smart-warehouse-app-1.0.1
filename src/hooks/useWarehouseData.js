import {useState, useEffect} from 'react';
import {fetchFilteredData} from '../utils/rtdbUtils';
import {getTimeRange} from "../utils/time";

export const useWarehouseData = (path = "/warehouse/data") => {
    const [data, setData] = useState([]);
    const [timeframe, setTimeframe] = useState("1month");
    const [isLoading, setIsLoading] = useState(false);
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date());

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [startTime, endTime] = getTimeRange(timeframe, customStartDate, customEndDate);
            const filteredData = await fetchFilteredData(path, startTime, endTime);
            setData(filteredData);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [timeframe, customStartDate, customEndDate]);

    return {
        data,
        timeframe,
        setTimeframe,
        isLoading,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        fetchData,
    };
};