import * as fs from "fs";
import * as path from "path";
import { parse } from "@fast-csv/parse";
import { writeToPath } from "@fast-csv/format";
import { SampleRow, TransformedRow } from './types';
import moment from 'moment-timezone';

// Our input and output files will be passed in the 3rd and 4th argument
if (process.argv.length == 2){
  process.argv[2] = 'sample.csv';
  process.argv[3] = 'output.csv';
}
const [inputFilePath, outputFilePath] = process.argv.slice(2);



// Transformations Required:
//
// Timestamp: format to RFC3339, convert from US/Pacific to US/Eastern (UTC time + 4 hours)
// Address: validate unicode, contains commas so ignore delimiters inside string value
// ZIP:  if length < 5 assume 0 as prefix
// FullName: Convert to Uppercase
// FooDuration: in format HH:MM:SS.MS convert to total seconds
// BarDuration: in format HH:MM:SS.MS convert to total seconds
// TotalDuration: FooDuration + BarDuration
// Notes: validate unicode, replace invalid characters with the Unicode Replacement Character.


const convertDurationtoSeconds = (duration: string): number => {
  const [hours, minutes, seconds] = duration.split(":");
  return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds);
};

const getTotalDuration = (foo: string, bar: string): number => {
  return convertDurationtoSeconds(foo) + convertDurationtoSeconds(bar);
};

const convertDate = (input: string): string => {
  let pacific = moment.tz(new Date(input), "America/Los_Angeles"); //  == PST
  let eastern = pacific.tz("America/New_York"); //== EST
  return eastern.toISOString();
};

const normalizeZIP = (input: string): string => {
  return input.padStart(5, "0");
};

const normalizeFullName = (input: string): string => {
  return input.toUpperCase();
};


const writeDataToOutputFile = (array: []) => {
  console.log(array);
  writeToPath(
    path.resolve(__dirname, outputFilePath),
    array,
    {
      headers: true,
      delimiter: ",",
      quote: '"',
    },
  )
    .on("error", (err) => console.log(err))
    .on("finish", () =>
      console.log(`Completed writing output to ${outputFilePath}`)
    );
};

// // this is a hacky way to do type checking on the passed in row, without declaring a verbose Type Guard.
// const validateRow = (row:any): boolean => {
//   return (['TransformedRow'].includes((typeof row).toString()));
// }

const resultCsv: any = [];
fs.createReadStream(path.resolve(__dirname, inputFilePath))
  .pipe(
    parse<SampleRow, TransformedRow>({
      headers: true,
      delimiter: ",",
      quote: '"',
      ignoreEmpty: true,
    })
  )
  // .validate((data: any): void => { validateRow(data) })
  .transform((data: SampleRow, cb): void => {
    setImmediate(() =>
      cb(null, {
        Timestamp: convertDate(data.Timestamp),
        Address: data.Address,
        ZIP: normalizeZIP(data.ZIP),
        FullName: normalizeFullName(data.FullName),
        FooDuration: convertDurationtoSeconds(data.FooDuration),
        BarDuration: convertDurationtoSeconds(data.BarDuration),
        TotalDuration: getTotalDuration(data.FooDuration, data.BarDuration),
        Notes: data.Notes,
      })
    );
  })
  .on("error", (error) => console.error(error))
  .on("data", (row) => {
    resultCsv.push(Object.values(row));
  })
  .on("data-invalid", (row:TransformedRow, rowNumber) => {
        console.log(`Invalid [rowNumber=${rowNumber}] [row=${JSON.stringify(row)}]`)
  })
  .on("end", (rowCount: number) => {
    console.log(`Parsed ${rowCount} rows`);
    writeDataToOutputFile(resultCsv);
  });
