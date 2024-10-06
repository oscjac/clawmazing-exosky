import './App.css';
import { useEffect, useState, FC } from 'react';
import { ExoplanetDetail, StarDetail, StarExoplanet } from './include/data';
import { SolarPreview } from './components';
import { Title } from './components/Title';
import { X } from 'lucide-react';
import { Howl } from 'howler'
import { Exoplanets, StarData } from './components';
import Orrery from '@/components/Orerry';

const planetsIn = (host: string, data: Exoplanets, starData: StarData): ExoplanetDetail[] => {
    const star = starData[host];
    if (!star) {
        return [];
    }
    return star.allExo.map(exoplanet => data[exoplanet.name]).filter(Boolean);
}

interface SolarSystemProps {
    system: StarDetail;
    planets: Exoplanets;
    host: string;
    navigateHome: () => void;
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
    const maxOrbit = Math.max(...props.system.allExo.map(p => p.dist_from_star || 0));
    const scaleFactor = Math.min(svgWidth, svgHeight) / 2 / maxOrbit;

    const handleClick = (planet: StarExoplanet) => {
        landingSound.play();
        // Find the planet in the list of all exoplanets
        const this_planet = props.planets[planet.name];
        setSelectedPlanet(this_planet);
    }

    const renderPlanet = (planet: StarExoplanet, idx: number) => {
        if (!planet.dist_from_star) {
            return null;
        }

        const orbit = (planet.dist_from_star || 0) * scaleFactor;
        const radius = Math.max(10, Math.log(planet.radius || 1) * 5);
        const angle = (idx / props.system.allExo.length) * 2 * Math.PI;
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
                    onClick={() => handleClick(planet)}
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
        <div>
            {/* <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                <rect width={svgWidth} height={svgHeight} className="space-background" 
                onClick={() => setSelectedPlanet(null)}/>
                <circle cx={centerX} cy={centerY} r="20" className="star" />
                {props.system.allExo.map(renderPlanet)}
            </svg> */}
            <Orrery systemData={props.system} exoplanets={props.planets} onClose={props.navigateHome} />
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
        <div>
            <h1>
                Solar Systems
            </h1>
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
        </div>
    );
}

const exitSound = new Howl({
    src: ['/exit.mp3'],
});

function App() {
    const [exoplanetData, setExoplanets] = useState<Exoplanets>({});
    const [starData, setStars] = useState<StarData>({});
    const [selectedSystem, setSelectedSystem] = useState<string | undefined>();
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
            {
                system === undefined && starData &&
                <Title navigateHome={() => { exitSound.play(); setSystem(undefined); setTitle('Solar systems'); }}>
                    ExpoSky by
                </Title> &&
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
                <SolarSystem
                    host={system}
                    system={starData[system]}
                    planets={exoplanetData}
                    navigateHome={() => { exitSound.play(); setSystem(undefined); setTitle('Solar systems') }} />
            }
        </div>
    );
}

export default App;