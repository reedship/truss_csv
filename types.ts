type SampleRow = {
  Timestamp: string;
  Address: string;
  ZIP: string;
  FullName: string;
  FooDuration: string;
  BarDuration: string;
  TotalDuration: string;
  Notes: string;
};

type TransformedRow = {
  Timestamp: string;
  Address: string;
  ZIP: string;
  FullName: string;
  FooDuration: number; // Number is stored as floating type so this datetype is fine
  BarDuration: number;
  TotalDuration: number;
  Notes: string;
};

export {
  SampleRow,
  TransformedRow,
}
