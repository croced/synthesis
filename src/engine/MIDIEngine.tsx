import { inRange } from "../util/util";

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
};

/**
 * Status Ranges describe the boundaries of MIDI status
 * messages (e.g. noteOn, noteOff, etc.) as a numerical
 * range (e.g. 0x80 - 0x8F) which we can check against.
 * 
 * For example, a status byte of 0x90 is in the range
 * of noteOn messages (0x90 - 0x9F) - so we can
 * determine that this is a noteOn message.
 */

export interface IStatusRange {
    [key: string]: [number, number];
}

const StatusRanges: IStatusRange = {
    noteOff: [0x80, 0x8F],
    noteOn: [0x90, 0x9F],
    polyAfterTouch: [0xA0, 0xAF],
    channelControl: [0xB0, 0xBF],
    programChange: [0xC0, 0xCF],
    channelAfterTouch: [0xD0, 0xDF],
    pitchBend: [0xE0, 0xEF],
};

const inStatusRange = (status: number, rangeName: string) => {
    if (!StatusRanges[rangeName]) throw new Error(`Invalid status range name: ${rangeName}`);
    return inRange(status, StatusRanges[rangeName][0], StatusRanges[rangeName][1]);
}

/**
 * GetMIDIMessage parses MIDI message event data and returns a (parsed) 
 * status message object.
 * 
 * @param data arrray containing the MIDI message data. This data 
 *  is obtained from the MIDIMessageEvent.data property
 * @returns the parsed MIDI message
 */

export const GetMIDIMessage = (data: Uint8Array): IStatusMessage => {
    const status: number = data[0];
    const secondByte: number = data[1];
    const thirdByte: number = data[2];
    
    const id: string = `${status}-${secondByte}-${thirdByte}` || "unknown";

    // 2 types of messages can signify a noteOff:
    // 1. status byte is in the range of noteOff (typical noteOff event)
    // 2. status byte is in the range of noteOn, but the velocity is 0 (noteOn event with velocity 0)
    if (inStatusRange(status, "noteOff") || (inStatusRange(status, "noteOn") && thirdByte === 0))
        return {
            id,
            message: "noteOff",
            channel: (status - StatusRanges.noteOff[0]) + 1,
            pitch: secondByte,
            velocity: thirdByte,
        };
    else if (inStatusRange(status, "noteOn"))
        return {
            id,
            message: "noteOn",
            channel: (status - StatusRanges.noteOn[0]) + 1,
            pitch: secondByte,
            velocity: thirdByte,
        };
    else if (inStatusRange(status, "polyAfterTouch"))
        return {
            id,
            message: "polyAfterTouch",
            channel: (status - StatusRanges.polyAfterTouch[0]) + 1,
            key: secondByte,
            pressure: thirdByte,
        };
    else if (inStatusRange(status, "channelControl"))
        return {
            id,
            message: "channelControl",
            channel: (status - StatusRanges.channelControl[0]) + 1,
            controller: secondByte,
            value: thirdByte,
        };
    else if (inStatusRange(status, "programChange"))
        return {
            id,
            message: "programChange",
            channel: (status - StatusRanges.programChange[0]) + 1,
            preset: secondByte,
        };
    else if (inStatusRange(status, "channelAfterTouch"))
        return {
            id,
            message: "channelAftertouch",
            channel: (status - StatusRanges.channelAfterTouch[0]) + 1,
            pressure: secondByte,
        };
    else if (inStatusRange(status, "pitchBend"))
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