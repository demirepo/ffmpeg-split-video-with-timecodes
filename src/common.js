import fsPromises from "fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { exec } from "node:child_process";

/**
 * Loads text file and returns array of strings
 * @param {string} path
 * @returns {Promise(string[])}
 */
export function stringArrayFromFile(path) {
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
 * Saves file to working dir
 * @param {string} filename
 * @param {string} text
 */
export const saveFile = async (filename, text) => {
  try {
    await fsPromises.writeFile(filename, text);
  } catch (error) {
    console.log("Error while saving file: ", error.message);
  }
};

// =============================================================================
/**
 * Parses process.argv,searches for key=value strings and returns corresponding object
 * @param {Object} dict Dictionary for matching short command line param and descriptive name for in-code usage
 * @returns {Object}
 */
export const parseArgv = (dict) => {
  let params = process.argv.reduce((acc, el) => {
    let [key, value] = el.split("=");
    if (key && value) {
      acc[dict[key]] = value; // renaming keys in args object according to argDict
    }
    return acc;
  }, {});
  return params;
};

// =============================================================================
/**
 * Runs new process
 * @param {string} bin Path to executable
 * @param {string} args Arguments
 */
export const execBin = (bin, args) => {
  const cmd = `${bin} ${args}`;
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
