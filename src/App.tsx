import './App.css';
import { useEffect, useState, FC } from 'react';
import { ExoplanetDetail, StarDetail } from './include/data';
import { SolarPreview } from './components';
import { Title } from './components/Title';
import { X } from 'lucide-react';
import { Howl } from 'howler'

type Exoplanets = { [key: string]: ExoplanetDetail };
type StarData = { [key: string]: StarDetail };

const planetsIn = (host: string, data: Exoplanets, starData: StarData): ExoplanetDetail[] => {
    const star = starData[host];
    if (!star) {
        return [];
    }
    return star.allExo.map(exoplanet => data[exoplanet.name]).filter(Boolean);
}

interface SolarSystemProps {
    planets: ExoplanetDetail[];
    host: string;
}

const landingSound = new Howl({
    src: ['/landing.mp3'],
  });

const SolarSystem: FC<SolarSystemProps> = props => {
    const [selectedPlanet, setSelectedPlanet] = useState<ExoplanetDetail | null>(null);
    const svgWidth = window.innerWidth;
    const svgHeight = window.innerHeight;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const maxOrbit = Math.max(...props.planets.map(p => p.edistance || 0));
    const scaleFactor = Math.min(svgWidth, svgHeight) / 2 / maxOrbit;

    const renderPlanet = (planet: ExoplanetDetail, idx: number) => {
        if (!planet.edistance) {
            return null;
        }

        const orbit = (planet.edistance || 0) * scaleFactor;
        const radius = Math.max(10, Math.log(planet.radius || 1) * 5);
        const angle = (idx / props.planets.length) * 2 * Math.PI;
        const x = centerX + orbit * Math.cos(angle);
        const y = centerY + orbit * Math.sin(angle);
        const animationDuration = (planet.period || 365) * 10;

        return (
            <g key={planet.name}>
                <circle
                    className={`planet planet-${idx}`}
                    cx={x}
                    cy={y}
                    r={radius}
                    onClick={() => {landingSound.play();setSelectedPlanet(planet);}}
                    style={{
                        animationDuration: `${animationDuration}s`,
                        transformOrigin: `${centerX}px ${centerY}px`
                    }}
                />
                <circle
                    className="orbit-path"
                    cx={centerX}
                    cy={centerY}
                    r={orbit}
                />
            </g>
        );
    };

    return (
        <div className="solar-system-container">
            <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                <rect width={svgWidth} height={svgHeight} className="space-background" 
                onClick={() => setSelectedPlanet(null)}/>
                <circle cx={centerX} cy={centerY} r="20" className="star" />
                {props.planets.map(renderPlanet)}
            </svg>
            {selectedPlanet && (
                <div className="planet-details-panel">
                    <button 
                        className="close-button"
                        onClick={() => setSelectedPlanet(null)}
                    >
                        <X size={24} />
                    </button>
                    <h3>{selectedPlanet.name}</h3>
                    <p>Radius: {selectedPlanet.radius} Earth radii</p>
                    <p>Mass: {selectedPlanet.mass} Earth masses</p>
                    <p>Period: {selectedPlanet.period} days</p>
                    <p>Distance from star: {selectedPlanet.edistance} AU</p>
                </div>
            )}
        </div>
    );
}


interface SolarGridProps {
    n: number;
    data: Exoplanets;
    starData: StarData;
    chunks: string[][];
    hosts: string[];
    setSystem: (name: string) => void;
}

const SolarGrid: FC<SolarGridProps> = props => {
    return (
        <div className='solar-grid'>
            {props.chunks.slice(0, props.n).map((hosts, index) =>
                <div key={index}>
                    {hosts.map((host, index) =>
                        <SolarPreview
                            key={index}
                            host={host}
                            planets={planetsIn(host, props.data, props.starData)}
                            setSystem={props.setSystem} />
                    )}
                </div>
            )}
        </div>
    );
}

const exitSound = new Howl({
    src: ['/exit.mp3'],
  });

function App() {
    const [exoplanetData, setExoplanets] = useState<Exoplanets>({});
    const [starData, setStars] = useState<StarData>({});
    const [title, setTitle] = useState<string>('Solar systems');
    const [system, setSystem] = useState<string | undefined>();

    useEffect(() => {
        const fetchData = async () => {
            const exoplanetRes = await fetch('/habitable_worlds.json');
            const starRes = await fetch('/solar_systems.json');

            if (exoplanetRes.ok && starRes.ok) {
                const exoplanetData: Exoplanets = await exoplanetRes.json();
                const starData: StarData = await starRes.json();
                setExoplanets(exoplanetData);
                setStars(starData);
            } else {
                console.error('Failed to fetch data');
            }
        };
        fetchData();
    }, []);

    const hosts = Object.keys(starData);
    const n = 4;
    const hostsChunks = hosts.reduce((resultArray: string[][], item, index) => {
        const chunkIndex = Math.floor(index / 4);
        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [];
        }
        resultArray[chunkIndex].push(item);
        return resultArray;
    }, []);

    return (
        <div className="app-container">
            <Title navigateHome={() => { exitSound.play(); setSystem(undefined); setTitle('Solar systems'); }}>
                ExpoSky by
            </Title>
            <h1>{title}</h1>
            {
                system === undefined && starData &&
                <SolarGrid
                    hosts={hosts}
                    starData={starData}
                    data={exoplanetData}
                    setSystem={name => { setSystem(name); setTitle(name); }}
                    n={n}
                    chunks={hostsChunks} />
            }
            {
                system && exoplanetData && starData &&
                <SolarSystem host={system} planets={planetsIn(system, exoplanetData, starData)} />
            }
        </div>
    );
}

export default App;