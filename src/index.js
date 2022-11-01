import dotenv from "dotenv";
// import { existsSync } from "fs";
import fsPromises from "fs/promises";
import { exec } from "node:child_process";
import { mkdir, existsSync, readFileSync } from "node:fs";

// const str = `
// Introduction

// 0:00 intro-welcome
// Fundamentals Recap
// 7:12 combinators
// 9:56 selector-exercise-solution
// 16:28 color-formats
// 24:34 debugging
// Rendering Logic I
// 32:26 inheritance
// 34:26 box-model-devtools
// 36:55 box-sizing
// 39:48 01-05-padding-units
// 43:35 margin-exercise-1
// 45:27 margin-exercise-3
// 48:57 width-algorithm
// 52:01 01-10-max-width-wrapper-refilm
// 54:48 01-10-width-exercise-solution
// 56:46 margin-collapse
// 58:44 module-1-workshop

// Rendering Logic II

// 1:25:54 absolute-sizes
// 1:31:51 02-02-absolute-centering
// 1:34:16 containing-block-exercise-1
// 1:37:14 02-06-tooltip-exercise-reshoot
// 1:43:43 stacking-contexts-intro-fixed
// 1:47:52 02-10-portals-revised
// 2:01:20 02-13-ex-solution
// 2:04:11 sticky-exercise-solution-1
// 2:08:26 sticky-exercise-solution-2
// 2:10:22 hidden-content-accessibility
// 2:16:34 module-2-workshop-brief
// 2:19:46 module-2-workshop-solution-1
// 2:21:38 module-2-workshop-solution-2
// 2:29:07 module-2-workshop-solution-3
// 2:34:59 module-2-workshop-solution-4
// 2:39:32 video-archive-14-scrollburglar

// Modern Component Architecture

// 2:47:21 01-intro
// 2:57:39 01-styled-components
// 3:11:43 03-styled-components-worked-example
// 3:26:01 06-exercise-1
// 3:29:28 06-exercise-2
// 3:35:26 06-exercise-3
// 3:39:01 07-my-global-styles
// 3:46:41 08-dynamic-styles
// 3:55:34 09-ex1
// 4:00:41 09-ex2
// 4:05:14 10-css-specialty
// 4:09:09 10-component-libraries-third-party
// 4:14:01 11-breadcrumbs
// 4:25:52 12-button-brief
// 4:28:34 12-button-solution
// 4:44:59 13-link-button
// 4:49:35 15-source-of-styles-brief
// 4:53:30 15-source-of-styles-solution
// 5:00:06 workshop-brief
// 5:05:40 workshop-progress-solution
// 5:26:03 workshop-select-solution
// 5:51:47 workshop-IconInput-solution

// Flexbox

// 6:16:01 01-hello-flex
// 6:21:25 02-cardinality
// 6:27:58 02-ex1-solutions
// 6:29:17 02-ex2-solution
// 6:33:05 02-solution-3
// 6:37:08 03-align-center-pseudo-exercise
// 6:41:19 03-exercise-solution
// 6:44:03 04-grow-shrink-basis
// 6:52:39 04-ex1-solution
// 6:54:12 05-flex-shorthand
// 6:59:22 05-ex1-solution
// 7:01:58 06-ex1-solution
// 7:02:51 constraints-ex2-solution
// 7:11:04 07-shorthand-gotcha
// 7:13:40 08-wrap-intro
// 7:16:48 08-wrapping-content-vs-items
// 7:19:01 08-ex1-solution
// 7:20:51 09-gap
// 7:25:33 09-ex1-solution
// 7:26:58 09-ex2-solution
// 7:32:24 10-ex1-solution
// 7:35:56 12-ex1-solution
// 7:41:28 13-holy-grail
// 7:44:57 13-sticky-troubleshooting
// 7:47:03 13-overstuffed
// 7:48:12 workshop-housekeeping
// 7:50:55 workshop-ex1-solution
// 7:58:15 workshop-ex2-solution
// 8:05:16 workshop-ex3-solution
// 8:13:56 workshop-ex4-solution
// 8:22:58 workshop-ex5-solution

// Responsive and Behavioural CSS

// 8:33:10 04-ex1-solution
// 8:36:50 05-modal-exercise
// 8:45:14 05-accessible-modals
// 8:54:25 07-css-variables-solution
// 8:58:01 08-ex1-solution
// 9:02:58 08-ex2-solution
// 9:08:10 art-project
// 9:20:27 11-exercise-solution
// 9:27:23 13-scrollburglars-01-final
// 9:32:49 13-scrollburglars-02
// 9:41:25 13-scrollburglar-03-solution
// 9:49:33 13-scrollburglars-3-extras
// 9:59:41 16-fluid-typography-ex1-solution
// 10:01:37 16-fluid-gap-ex2-solution
// 10:03:38 14-fluid-vs-responsive
// 10:14:15 workshop-part1-solution
// 10:23:59 workshop-part2-solution
// 10:39:06 workshop-03-solution
// 10:53:03 workshop-04-solution
// 11:07:27 workshop-ex5-solution
// 11:18:08 workshop-ex6-solution-fix

// Typography and Images

// 11:27:01 ex-solution
// 11:29:26 solution
// 11:37:01 masonry-layout-intro
// 11:41:28 stealing-google-fonts
// 11:47:33 google-fonts
// 11:51:30 variable-fonts-ex-solution
// 11:59:35 object-fit-demo`;
// =============================================================================

/**
 * Loads text file and returns array of strings
 * @param {string} path
 * @returns {Promise(string[])}
 */
function fileToStringArray(path) {
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

// VARS
// =============================================================================

dotenv.config();
const ffmpegDir = process.env.FFMPEG_DIR;

const outDir = "output";
const srcDir = "d:\\ffmpeg\\bin\\";

let currentTitle = null;
let result = "";
let timeStampCounter = 1;
let titleCounter = 1;

// =============================================================================
const input = await fileToStringArray("content.txt");

const makeCmdFile = (input) => {
  input.forEach((line) => {
    if (!line) return;
    // if line not begins with a timestamp - it's a title
    if (!isTimestamp(line)) {
      currentTitle = `${makeTwoDigits(titleCounter++)}-${line}`;
      // creating directories by title, so ffmpeg won't throw error 'directory not found'
      mkdir(`${outDir}//${currentTitle}`, { recursive: true }, (err) => {
        if (err) throw err;
      });
    } else {
      // то есть, строка - таймстэмп. Значит - получаем значения для подстановки в команду
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
      result += `-ss ${chunkStart}${endTimeString} -i "${srcDir}input.mp4" -c copy "output\\${currentTitle}\\${chunkName}.mp4"\n`;

      timeStampCounter++;
    }
  });

  saveFile(result);
};

makeCmdFile(input);

// Running ffmpeg
// =============================================================================

const execFfmpeg = (command) => {
  exec(`${ffmpegDir}\\ffmpeg ${command}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      console.error(`Exited with error code: ${error.code}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
};

// execFfmpeg(
//   '-ss 11:59:35  -i input.mp4 -c copy "output\\Typography and Images\\object-fit-demo.mp4"'
// );
