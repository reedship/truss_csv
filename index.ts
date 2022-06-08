import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@fast-csv/parse';
import { writeToPath } from '@fast-csv/format';
// Our input and output files will be passed in the 3rd and 4th argument
if (process.argv.length < 4) {
  throw Error("Invalid arguments.\n Usage: 'npm start <inputFilePath> <outputFilePath>'");
}
const [inputFilePath, outputFilePath] = process.argv.slice(2);

type SampleRow = {
  Timestamp: string,
  Address: string,
  ZIP: string,
  FullName: string,
  FooDuration: string,
  BarDuration: string,
  TotalDuration: string,
  Notes: string
}

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

type TransformedRow = {
  Timestamp: string,
  Address: string,
  ZIP: string,
  FullName: string,
  FooDuration: number, // Number is stored as floating type so this datetype is fine
  BarDuration: number,
  TotalDuration: number,
  Notes: string
}

const convertDurationtoSeconds = (duration:string): number => {
    const [hours, minutes, seconds] = duration.split(':');
    return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds);
};

const getTotalDuration = (foo: string, bar: string): number => {
  return convertDurationtoSeconds(foo) + convertDurationtoSeconds(bar);
}

const convertDate = (input: string): string => {
  try {
    return new Date(input).toISOString();
  } catch(err) {
    console.log(input);
    throw err;
  }
}
const normalizeZIP = (input: string) : string => {
  return input.padStart(5,'0');
}
//TODO:: make these functions
const normalizeFullName = (input: string) : string => {
  return input.toUpperCase();
}
const normalizeString = (input: string) : string => {
  return input;
}

const writeDataToOutputFile = (array: []) => {
  console.log(array);
  writeToPath(path.resolve(__dirname, outputFilePath), array)
    .on('error', err=> console.log(err))
    .on('finish', ()=> console.log(`Completed writing output to ${outputFilePath}`));
}

const resultCsv: any = [];
fs.createReadStream(path.resolve(__dirname, inputFilePath))
    .pipe(parse<SampleRow, TransformedRow>({
        headers: true,
        delimiter: ',',
        quote: '"',
        ignoreEmpty: true,
    }))
    .transform(
      (data: SampleRow, cb): void => {
        setImmediate(()=>
          cb(null, {
            Timestamp: convertDate(data.Timestamp),
            Address: data.Address,
            ZIP: normalizeZIP(data.ZIP),
            FullName: normalizeFullName(data.FullName),
            FooDuration: convertDurationtoSeconds(data.FooDuration),
            BarDuration: convertDurationtoSeconds(data.BarDuration),
            TotalDuration: getTotalDuration(data.FooDuration, data.BarDuration),
            Notes: normalizeString(data.Notes)
          }))
      }
    )
    .on('error', error => console.error(error))
    .on('data', row => {
      resultCsv.push(Object.values(row));
    })
  .on('end', (rowCount: number) => {
      console.log(`Parsed ${rowCount} rows`)
      writeDataToOutputFile(resultCsv);
  });
