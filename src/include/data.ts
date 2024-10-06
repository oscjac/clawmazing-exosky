// Reads in data.csv and gets the information for each plane in exoPlanets
import Papa from 'papaparse';

// Define interface for each exoplanet's detailed data
export interface ExoplanetDetail {
    name: string;
    type: string;
    detection_method: string;
    mass: number;
    radius: number;
    flux: number;
    Tsurf: string;
    period: number;
    edistance: number;
    age: string;
    ESI: number;
}

// Define interface for a star and its corresponding exoplanets
export interface StarDetail {
    name: string;
    radius: number;
    starMass: number;
    allExo: StarExoplanet[];
    numPlanets: number;
}

// Define interface for individual exoplanets around a star (from the second JSON)
export interface StarExoplanet {
    name: string;
    radius: number;
    period: number;
    home_star: string;
    dist_from_star: number;
}

export async function readCSV(url: string) {
  const response = await fetch(url);
  const csvData = await response.text();

  // Filter out lines that begin with #
  const filteredData = csvData.split('\n').filter((line) => !line.startsWith('#')).join('\n');
  
  return new Promise<ExoplanetDetail[]>((resolve, reject) => {
    Papa.parse<ExoplanetDetail>(filteredData, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
}

// Usage
// import {parse} from 'csv-parser'

const exoPlanets: string[] = ["GJ 163 c",
  "GJ 180 c",
  "GJ 180 d",
  "GJ 229 A c",
  "GJ 273 b",
  "GJ 357 d",
  "GJ 367 d",
  "GJ 433 d",
  "GJ 514 b",
  "GJ 667 C c",
  "GJ 667 C e",
  "GJ 667 C f",
  "GJ 682 b",
  "GJ 1002 b",
  "GJ 1002 c",
  "GJ 1061 c",
  "GJ 1061 d",
  "GJ 3293 d",
  "HD 40307 g",
  "HD 216520 c",
  "HIP 38594 b",
  "HN Lib b",
  "K2-3 d",
  "K2-9 b",
  "K2-18 b",
  "K2-72 e",
  "K2-288 B b",
  "K2-332 b",
  "Kepler-22 b",
  "Kepler-62 e",
  "Kepler-62 f",
  "Kepler-155 c",
  "Kepler-174 d",
  "Kepler-186 f",
  "Kepler-283 c",
  "Kepler-296 e",
  "Kepler-296 f",
  "Kepler-440 b",
  "Kepler-442 b",
  "Kepler-443 b",
  "Kepler-452 b",
  "Kepler-705 b",
  "Kepler-1229 b",
  "Kepler-1410 b",
  "Kepler-1540 b",
  "Kepler-1544 b",
  "Kepler-1606 b",
  "Kepler-1638 b",
  "Kepler-1649 c",
  "Kepler-1652 b",
  "Kepler-1653 b",
  "Kepler-1701 b",
  "LHS 1140 b",
  "LP 890-9 c",
  "Proxima Cen b",
  "Ross 128 b",
  "Ross 508 b",
  "TOI-700 d",
  "TOI-700 e",
  "TOI-715 b",
  "TOI-904 c",
  "TOI-2257 b",
  "TRAPPIST-1 d",
  "TRAPPIST-1 e",
  "TRAPPIST-1 f",
  "TRAPPIST-1 g",
  "Teegarden's Star b",
  "Teegarden's Star c",
  "Wolf 1061 c",
  "Wolf 1069 b"]
