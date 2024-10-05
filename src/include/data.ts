// Reads in data.csv and gets the information for each plane in exoPlanets
import Papa from 'papaparse';

export interface Exoplanet {
  pl_name: string;
  hostname: string;
  default_flag: number;
  sy_snum: number;
  sy_pnum: number;
  discoverymethod: string;
  disc_year: number;
  disc_facility: string;
  soltype: string;
  pl_controv_flag: number;
  pl_refname: string;
  pl_orbper: number;
  pl_orbpererr1: number;
  pl_orbpererr2: number;
  pl_orbperlim: number;
  pl_orbsmax: number | null;
  pl_orbsmaxerr1: number | null;
  pl_orbsmaxerr2: number | null;
  pl_orbsmaxlim: number | null;
  pl_rade: number | null;
  pl_radeerr1: number | null;
  pl_radeerr2: number | null;
  pl_radelim: number | null;
  pl_radj: number | null;
  pl_radjerr1: number | null;
  pl_radjerr2: number | null;
  pl_radjlim: number | null;
  pl_bmasse: number;
  pl_bmasseerr1: number;
  pl_bmasseerr2: number;
  pl_bmasselim: number;
  pl_bmassj: number;
  pl_bmassjerr1: number;
  pl_bmassjerr2: number;
  pl_bmassjlim: number;
  pl_bmassprov: string;
  pl_orbeccen: number | null;
  pl_orbeccenerr1: number | null;
  pl_orbeccenerr2: number | null;
  pl_orbeccenlim: number | null;
  pl_insol: number | null;
  pl_insolerr1: number | null;
  pl_insolerr2: number | null;
  pl_insollim: number | null;
  pl_eqt: number | null;
  pl_eqterr1: number | null;
  pl_eqterr2: number | null;
  pl_eqtlim: number | null;
  ttv_flag: number;
  st_refname: string;
  st_spectype: string | null;
  st_teff: number;
  st_tefferr1: number;
  st_tefferr2: number;
  st_tefflim: number;
  st_rad: number;
  st_raderr1: number;
  st_raderr2: number;
  st_radlim: number;
  st_mass: number;
  st_masserr1: number;
  st_masserr2: number;
  st_masslim: number;
  st_met: number;
  st_meterr1: number;
  st_meterr2: number;
  st_metlim: number;
  st_metratio: string;
  st_logg: number;
  st_loggerr1: number;
  st_loggerr2: number;
  st_logglim: number;
  sy_refname: string;
  rastr: string;
  ra: number;
  decstr: string;
  dec: number;
  sy_dist: number;
  sy_disterr1: number;
  sy_disterr2: number;
  sy_vmag: number;
  sy_vmagerr1: number;
  sy_vmagerr2: number;
  sy_kmag: number;
  sy_kmagerr1: number;
  sy_kmagerr2: number;
  sy_gaiamag: number;
  sy_gaiamagerr1: number;
  sy_gaiamagerr2: number;
  rowupdate: string;
  pl_pubdate: string;
  releasedate: string;
}

export async function readCSV(url: string) {
  const response = await fetch(url);
  const csvData = await response.text();

  // Filter out lines that begin with #
  const filteredData = csvData.split('\n').filter((line) => !line.startsWith('#')).join('\n');
  
  return new Promise<Exoplanet[]>((resolve, reject) => {
    Papa.parse<Exoplanet>(filteredData, {
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
