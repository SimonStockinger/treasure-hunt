import type { DayData, Point } from "../types";

export interface ColumnLayout {
    dayData: DayData;
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    headerHeight: number;
    eventRowHeight: number;
}

const TOTAL_WIDTH = 1400;
const PADDING_X = 40;
const GAP_X = 18;
const START_Y = 90;
const HEADER_HEIGHT = 65;
const ROW_HEIGHT = 110;

export function calculateColumns(days: DayData[]): ColumnLayout[] {
    const numDays = 7;
    const availableWidth = TOTAL_WIDTH - PADDING_X * 2 - GAP_X * (numDays - 1);
    const colWidth = availableWidth / numDays;

    const weekDayKeys = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

    return weekDayKeys.map((key, index) => {
        const dayData = days.find((d) => d.day === key) || {
            day: key as any,
            label: key,
            events: [],
        };

        const eventCount = Math.max(dayData.events.length, 1);
        const height = HEADER_HEIGHT + eventCount * ROW_HEIGHT + 30;

        return {
            dayData,
            index,
            x: PADDING_X + index * (colWidth + GAP_X),
            y: START_Y,
            width: colWidth,
            height: Math.max(height, 420),
            headerHeight: HEADER_HEIGHT,
            eventRowHeight: ROW_HEIGHT,
        };
    });
}
