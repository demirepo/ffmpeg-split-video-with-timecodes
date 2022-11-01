import { mkdir } from "node:fs";
import {
  isTimestamp,
  makeTwoDigits,
  normalizeTimestampt,
  getNextTimestamp,
} from "./utility.js";
import { paths } from "./index.js";

let commandList = "";
let currentTitle = null;
let timeStampCounter = 1;
let titleCounter = 1;

export const getCommandList = (input) => {
  input.forEach((line) => {
    if (!line) return;
    // if line not begins with a timestamp - it's a title
    if (!isTimestamp(line)) {
      currentTitle = `${makeTwoDigits(titleCounter++)}-${line}`;
      // creating directories by title, so ffmpeg won't throw error 'directory not found'
      mkdir(`${paths.output}//${currentTitle}`, { recursive: true }, (err) => {
        if (err) throw err;
      });
    } else {
      // we got timestamp. Getting values for interpolation string
      let chunkEnd;
      let [chunkStart, chunkName] = line.split(" ");

      chunkStart = normalizeTimestampt(chunkStart);
      chunkName = `${makeTwoDigits(timeStampCounter)}-${chunkName}`;

      const nextEl = getNextTimestamp(line, input);
      if (nextEl) {
        chunkEnd = nextEl.split(" ")[0];
        chunkEnd = normalizeTimestampt(chunkEnd);
      } else chunkEnd = "";

      const endTimeString = chunkEnd !== "" ? ` -to ${chunkEnd} ` : " ";
      commandList += `-ss ${chunkStart}${endTimeString}-i ${paths.video} -c copy "${paths.output}\\${currentTitle}\\${chunkName}.mp4" -y\n`;

      timeStampCounter++;
    }
  });
  return commandList;
};
