const inRange = (num: number, min: number, max: number) => {
    return num >= min && num <= max;
}

interface IStatusRange {
    [key: string]: [number, number];
}

export interface IStatusMessage {
    id: string;
    message: string;
    channel?: number;
    pitch?: number | null;
    velocity?: number | null;
    controller?: number | null;
    pressure?: number | null;
    preset?: number | null;
    key?: number | null;
    value?: number | null;
    bendLSB?: number | null;
    bendMSB?: number | null;
}

const StatusRanges: IStatusRange = {
    noteOff: [0x80, 0x8F],
    noteOn: [0x90, 0x9F],
    polyAfterTouch: [0xA0, 0xAF],
    channelControl: [0xB0, 0xBF],
    programChange: [0xC0, 0xCF],
    channelAfterTouch: [0xD0, 0xDF],
    pitchBend: [0xE0, 0xEF],
}

// todo: remove 'any' typing here
export const GetMIDIMessage = (data: any): IStatusMessage => {
    const status = data[0];
    const secondByte = data[1];
    const thirdByte = data[2];
    const id: string = `${status}-${secondByte}-${thirdByte}`;

    if (inRange(status, StatusRanges.noteOff[0], StatusRanges.noteOff[1]) || (inRange(status, StatusRanges.noteOn[0], StatusRanges.noteOn[1]) && thirdByte === 0))
        return {
            id,
            message: "noteOff",
            channel: (status - StatusRanges.noteOff[0]) + 1,
            pitch: secondByte,
            velocity: thirdByte,
        };
    else if (inRange(status, StatusRanges.noteOn[0], StatusRanges.noteOn[1]))
        return {
            id,
            message: "noteOn",
            channel: (status - StatusRanges.noteOn[0]) + 1,
            pitch: secondByte,
            velocity: thirdByte,
        };
    else if (inRange(status, StatusRanges.polyAfterTouch[0], StatusRanges.polyAfterTouch[1]))
        return {
            id,
            message: "polyAfterTouch",
            channel: (status - StatusRanges.polyAfterTouch[0]) + 1,
            key: secondByte,
            pressure: thirdByte,
        };
    else if (inRange(status, StatusRanges.channelControl[0], StatusRanges.channelControl[1]))
        return {
            id,
            message: "channelControl",
            channel: (status - StatusRanges.channelControl[0]) + 1,
            controller: secondByte,
            value: thirdByte,
        };
    else if (inRange(status, StatusRanges.programChange[0], StatusRanges.programChange[1]))
        return {
            id,
            message: "programChange",
            channel: (status - StatusRanges.programChange[0]) + 1,
            preset: secondByte,
        };
    else if (inRange(status, StatusRanges.channelAfterTouch[0], StatusRanges.channelAfterTouch[1]))
        return {
            id,
            message: "channelAftertouch",
            channel: (status - StatusRanges.channelAfterTouch[0]) + 1,
            pressure: secondByte,
        };
    else if (inRange(status, StatusRanges.pitchBend[0], StatusRanges.pitchBend[1]))
        return {
            id,
            message: "pitchBend",
            channel: (status - StatusRanges.pitchBend[0]) + 1,
            bendLSB: secondByte,
            bendMSB: thirdByte,
        };
    else
        return { id, message: "unknown" };
}