export const noteToFreq = (note: number) => {
    let a = 440; // frequency of A (common value is 440Hz)
    return (a / 32) * (2 ** ((note - 9) / 12));
}