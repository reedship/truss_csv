import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@fast-csv/parse';

// Our input and output files will be passed in the 3rd and 4th argument
if (process.argv.length < 4) {
  throw Error("Invalid arguments.\n Usage: 'npm start <inputFilePath> <outputFilePath>'");
}
const [inputFilePath, outputFilePath] = process.argv.slice(2);

type SampleRow = {
  Timestamp: string, // format to RFC3339, convert from US/Pacific to US/Eastern (UTC time + 4 hours)
  Address: string, //validate unicode, contains commas so ignore delimiters inside string value
  ZIP: string, // if length < 5 assume 0 as prefix
  FullName: string, // Convert to Uppercase
  FooDuration: string, // in format HH:MM:SS.MS convert to total seconds
  BarDuration: string, // same
  TotalDuration: string, // FooDuration + BarDuration
  Notes: string //validate unicode, replace invalid characters with the Unicode Replacement Character.
}
type TransformedRow = {
  Timestamp: string, //RFC3339 format == Date().toISOString();
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
//TODO:: make these functions
const convertDate = (input: string): string => {
  try {
    return new Date(input).toISOString();
  } catch(err) {
    console.log(input);
    throw err;
  }
}
const normalizeZIP = (input: string) : string => {
  return input;
}
const normalizeFullName = (input: string) : string => {
  return input.toUpperCase();
}
const normalizeString = (input: string) : string => {
  return input;
}

let parsed = fs.createReadStream(path.resolve(__dirname, inputFilePath))
    .pipe(parse<SampleRow, TransformedRow>({
        headers: true,
        delimiter: ',',
        quote: '"',
    }))
    .transform(
      (data: SampleRow): TransformedRow => ({
        Timestamp: convertDate(data.Timestamp),
        Address: data.Address,
        ZIP: normalizeZIP(data.ZIP),
        FullName: normalizeFullName(data.FullName),
        FooDuration: convertDurationtoSeconds(data.FooDuration),
        BarDuration: convertDurationtoSeconds(data.BarDuration),
        TotalDuration: getTotalDuration(data.FooDuration, data.BarDuration),
        Notes: normalizeString(data.Notes)
      })
    )
    .on('error', error => console.error(error))
    .on('data', row => {
      console.log(row);
      // row.forEach((x:any)=>console.log(`${typeof x}: ${x}`));
    })
    .on('end', (rowCount: number) => console.log(`Parsed ${rowCount} rows`));
