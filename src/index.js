import dotenv from "dotenv";
import fsPromises from "fs/promises";
import { exec } from "node:child_process";
import { mkdir, existsSync, readFileSync } from "node:fs";

/**
 * Loads text file and returns array of strings
 * @param {string} path
 * @returns {Promise(string[])}
 */
function stringArrayFromFile(path) {
  let content;
  if (existsSync(path)) {
    content = readFileSync(path);
  } else {
    console.log(`File ${path} not found`);
  }
  return content.toString().split("\n");
}

// =============================================================================
/**
 * Detects whether param is timestamp
 * @param {string} text
 * @returns {boolean}
 */
const isTimestamp = (text) => /^\d{1,2}:\d{1,2}(:\d{1,2})?\s/.test(text);

// =============================================================================

/**
 * Returns 2-digit number with leading zero if param is 1-digit
 * @param {number} n
 * @returns {number}
 */
const makeTwoDigits = (n) => {
  return String(n).length > 1 ? n : `0${n}`;
};

// =============================================================================

/**
 * Normalizes datastamp making "00:07:12" from "7:12"
 * @param {string} stamp
 * @returns {string}
 */
const normalizeTimestampt = (stamp) => {
  // debugger;
  let splitted = stamp.split(":").map((el) => {
    return makeTwoDigits(el);
  });

  if (splitted.length !== 3) splitted.unshift("00");
  return splitted.join(":");
};

// =============================================================================

/**
 * Returns next timestamp from array, ignores titles
 * @param {string} current timestamp of "00:00 chunk_name" format
 * @param {string[]} arr array of timestamps and numbers
 * @returns {string}
 */
const getNextTimestamp = (current, arr) => {
  const position = arr.indexOf(current);
  for (let i = position + 1; i < arr.length; i++) {
    if (isTimestamp(arr[i])) return arr[i];
  }
  return null;
};

// =============================================================================

const saveFile = async (text) => {
  await fsPromises.writeFile(`commands.txt`, text);
};

// =============================================================================
/**
 * Parses process.argv,searches for key=value strings and returns corresponding object. Includes dictionary for matching short command line param and descriptive name for in-code usage
 * @returns {Object}
 */
const parseArgv = () => {
  const argDict = {
    e: "execPath",
    t: "timecodesPath", // timecodes path
    s: "sourcePath", // video source path
    o: "outputDir",
  };
  let params = process.argv.reduce((acc, el) => {
    let [key, value] = el.split("=");
    if (key && value) {
      acc[argDict[key]] = value; // renaming keys in args object according to argDict
    }
    return acc;
  }, {});
  return params;
};

// VARS
// =============================================================================

dotenv.config();
const cmdParams = parseArgv();

const paths = {
  exec: cmdParams.execPath || process.env.FFMPEG_DIR || "ffmpeg.exe",
  video: cmdParams.sourcePath || process.env.SOURCE_PATH || "input.mp4",
  timecodes:
    cmdParams.timecodesPath || process.env.TIMECODES_PATH || "timecodes.txt",
  output: cmdParams.outputDir || process.env.OUTPUT_DIR || "output",
};

let currentTitle = null;
let commands = "";
let timeStampCounter = 1;
let titleCounter = 1;

// =============================================================================
/**
 * Running ffmpeg
 * @param {string} command
 */
const execFfmpeg = (command) => {
  const cmd = `${paths.exec} ${command}`;
  const proc = exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      console.error(`Exited with error code: ${error.code}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  proc.on("exit", () => {
    console.log("clean exit!");
  });
};

// =============================================================================
const input = stringArrayFromFile(paths.timecodes);

const makeCmdFile = (input) => {
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
      commands += `-ss ${chunkStart}${endTimeString} -i ${paths.video} -c copy "${paths.output}\\${currentTitle}\\${chunkName}.mp4" -y\n`;

      timeStampCounter++;
    }
  });

  saveFile(commands);
};

makeCmdFile(input);

execFfmpeg(commands.split("\n")[0]);
