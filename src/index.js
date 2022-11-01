import dotenv from "dotenv";

import { parseArgv, saveFile, execBin, stringArrayFromFile } from "./common.js";
import { getCommandList } from "./getCommandList.js";

// VARIABLES
// =============================================================================

dotenv.config();
// command line parameters
const argDict = {
  e: "execPath", // path to ffmpeg.exe
  t: "timecodesPath", // timecodes path
  s: "sourcePath", // video source path
  o: "outputDir",
};
const cmdParams = parseArgv(argDict);
export const paths = {
  exec: cmdParams.execPath || process.env.EXECUTABLE_PATH || "ffmpeg.exe",
  video: cmdParams.sourcePath || process.env.SOURCE_PATH || "input.mp4",
  timecodes:
    cmdParams.timecodesPath || process.env.TIMECODES_PATH || "timecodes.txt",
  output: cmdParams.outputDir || process.env.OUTPUT_DIR || "output",
};

// =============================================================================

const strings = stringArrayFromFile(paths.timecodes);

const commandList = getCommandList(strings);

saveFile(`commands.txt`, commandList);

execBin(paths.exec, commandList.split("\n")[0]);
