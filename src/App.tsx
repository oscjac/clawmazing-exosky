import './App.css'
import { useEffect } from 'react'
import { readCSV, Exoplanet } from './include/data';
import { useState } from 'react';
import { SolarPreview } from './components';
import { Title } from './components/Title'
import { FC } from 'react';

const planetsIn = (host: string, data: Exoplanet[]) => {
    return data.filter(planet => planet.hostname === host)
}

interface SolarSystemProps {
    planets: Exoplanet[]
    host: string
}

const SolarSystem: FC<SolarSystemProps> = props => {

    const maxOrbit = Math.max(...props.planets.map(p => p.pl_orbsmax || 0));
    const scaleFactor = 300 / maxOrbit;

    const renderPlanet = (planet: Exoplanet, idx: number) => {
        const orbit = (planet.pl_orbsmax || 0) * scaleFactor;
        const radius = Math.max(planet.pl_rade || 1, 3);
        const angle = (idx / props.planets.length) * 2 * Math.PI;
        const x = 350 + orbit * Math.cos(angle);
        const y = 350 + orbit * Math.sin(angle);

        const animationDuration = (planet.pl_orbper || 365) * 10;
    
        return (
          <g key={planet.pl_name}>
            <circle
            className='planet'
              cx={x}
              cy={y}
              r={radius}
              fill={`hsl(${idx * 30}, 70%, 50%)`}
              stroke="white"
              strokeWidth="1"
              style={{
                cursor: 'pointer',
                animation: `orbit ${animationDuration}s linear infinite`,
                transformOrigin: '50vw 50vh',
              }}
            />
            <circle
            className='orbit-path'
              cx="50vw"
              cy="50vh"
              r={orbit}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          </g>
        );
      };

    return (
        <div>
            <h2>{props.host}</h2>
            <div>
                <svg width="100vw" height="100vh" viewBox="0 0 100vw 100vh">
                    <rect width="100vw" height="100vh" fill="#0f172a" />
                    <circle cx="50vw" cy="50vh" r="20" fill="yellow" />
                    {props.planets.map(renderPlanet)}
                    </svg>
            </div>
        </div>
    )
}

interface SolarGridProps {
    n: number
    data: Exoplanet[]
    chunks: string[][]
    hosts: string[]
    planets: Exoplanet[]
    setSystem: (name: string) => void
}

const SolarGrid: FC<SolarGridProps> = props => {
    return (
        <div className='solar-grid'>
            {
            props.chunks.slice(0, props.n).map((hosts, index) =>
            <div key={index}>
                {
                hosts.map((host, index) =>
                <SolarPreview
                key={index}
                host={host}
                planets={planetsIn(host, props.data)}
                setSystem={props.setSystem}/>)
                }
            </div>)
            }
        </div>
    )
}

function App() {
    const [data, setData] = useState<Exoplanet[]>([])
    const [title, setTitle] = useState<string>("Solar systems")
    const [system, setSystem] = useState<string | undefined>()

    const hosts = [...new Set(data.map(planet => planet.hostname))]

    const n = 4

    // Split the hosts into an array of arrays with 4 hosts each
    const hostsChunks = hosts.reduce((resultArray: string[][], item, index) => {
        const chunkIndex = Math.floor(index/4)
        if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [] // start a new chunk
        }
        resultArray[chunkIndex].push(item)
        return resultArray
    }, [])

    useEffect(() => {
        readCSV("/data1.csv").then(data => {
            setData(data)
        }, (error: any) => {
            console.error(error)
        })
    })

    if (data.length === 0) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <Title navigateHome={() => {setSystem(undefined); setTitle("Solar systems");}}>
                ExpoSky by CLAWS
            </Title>
            <h1>{title}</h1>
            {
                system === undefined &&
                <SolarGrid
                hosts={hosts}
                planets={data}
                setSystem={name => {setSystem(name); setTitle(name)}}
                n={n}
                chunks={hostsChunks}
                data={data}/>
            }
            {
                system && <SolarSystem host={system} planets={planetsIn(system, data)}/>
            }
        </div>
    )
}

export default App
