'use client';

import * as XLSX from 'xlsx';

export const readTeamsFromXLSX = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            reject(new Error("The XLSX file appears to be empty or corrupted."));
            return;
        }
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);
        
        if (json.length > 0 && !Object.prototype.hasOwnProperty.call(json[0], 'Team Codes')) {
          reject(new Error("Column 'Team Codes' not found in the first sheet. Please check the column header."));
          return;
        }

        const teams = json.map((row) => String(row['Team Codes']).trim()).filter(Boolean);
        resolve(teams);
      } catch (error) {
        reject(new Error('Failed to parse the XLSX file. It might be corrupted or in an unsupported format.'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };
    reader.readAsArrayBuffer(file);
  });
};


export const exportPairingsToXLSX = (round1: string[][], round2: string[][]) => {
  const wb = XLSX.utils.book_new();

  if (round1.length > 0) {
    const round1Data = round1.map(([team1, team2]) => ({ 'Team 1': team1, 'Team 2': team2 }));
    const ws1 = XLSX.utils.json_to_sheet(round1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'Round 1 Pairings');
  }

  if (round2.length > 0) {
    const round2Data = round2.map(([team1, team2]) => ({ 'Team 1': team1, 'Team 2': team2 }));
    const ws2 = XLSX.utils.json_to_sheet(round2Data);
    XLSX.utils.book_append_sheet(wb, ws2, 'Round 2 Pairings');
  }

  XLSX.writeFile(wb, 'draw_of_lots_results.xlsx');
};
