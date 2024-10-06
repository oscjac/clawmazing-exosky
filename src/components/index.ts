export * from './SolarPreview.tsx'
import { ExoplanetDetail } from '@/include/data.ts';
import { StarDetail } from '@/include/data.ts';

export type Exoplanets = { [key: string]: ExoplanetDetail };
export type StarData = { [key: string]: StarDetail };
