import { useState, useEffect, useRef, FC } from 'react';
import { X } from 'lucide-react';
import * as THREE from 'three';
import { ExoplanetDetail, StarDetail, StarExoplanet } from '@/include/data';
import { Howl } from 'howler';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { ExpressionNode } from 'three/webgpu';

type OrerryProps = {
    systemData: StarDetail;
    exoplanets: { [key: string]: ExoplanetDetail | undefined };
    onClose: () => void;
}

const landingSound = new Howl({ src: ['/landing.mp3'] })
const exitSound = new Howl({ src: ['/exit.mp3'] })

const format = (num: number | undefined, places: number = 3) => {
    // Outputs a string with a fixed number of decimal places
    // and locale-specific separators.
    if (num === undefined) return '';
    return num.toLocaleString(undefined, {
        minimumFractionDigits: places,
        maximumFractionDigits: places,
    });
}

const Orrery: FC<OrerryProps> = ({ systemData, exoplanets, onClose }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [selectedPlanet, setSelectedPlanet] = useState<ExoplanetDetail | undefined>();

    let colors: THREE.Color[] = [
        new THREE.Color(79 / 256, 76 / 256, 176 / 256),
        new THREE.Color(107 / 256, 147 / 256, 214 / 256),
        new THREE.Color(233 / 256, 239 / 256, 249 / 256),
        new THREE.Color(159 / 256, 193 / 256, 100 / 256),
        new THREE.Color(216 / 256, 197 / 256, 150 / 256),
    ]

    const maxOrbit = Math.max(...systemData.allExo.map(p => p.dist_from_star || 0));
    const scaleFactor = 10 / maxOrbit;

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;
        const { width, height } = currentMount.getBoundingClientRect();

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(width, height);
        currentMount.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(0, 0, 0);
        scene.add(pointLight);

        // Star (Sun)
        const starGeometry = new THREE.SphereGeometry(1, 32, 32);
        const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        scene.add(star);

        // Planets
        const createPlanet = (planetData: StarExoplanet) => {
            const { dist_from_star, period, name } = planetData;

            const exoplanet = exoplanets[name];

            if (!exoplanet) return null;

            // Normalize radius and distance
            const scaledRadius = exoplanet.radius;
            const scaledDistance = dist_from_star * scaleFactor;

            const planetGeometry = new THREE.SphereGeometry(scaledRadius, 32, 32);
            // Choose a random color for the planet
            const color = colors[Math.floor(Math.random() * colors.length)];
            colors = colors.filter(c => c !== color);
            const config: THREE.MeshBasicMaterialParameters = { color: new THREE.Color(color) };
            const planetMaterial = new THREE.MeshBasicMaterial(config);
            const planet = new THREE.Mesh(planetGeometry, planetMaterial);
            planet.userData = { name };

            const pivot = new THREE.Object3D();
            pivot.add(planet);
            planet.position.set(scaledDistance, 0, 0);
            scene.add(pivot);

            // Orbit path
            const orbitGeometry = new THREE.RingGeometry(scaledDistance - 0.1, scaledDistance + 0.1, 64);
            const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
            const orbitPath = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbitPath.rotation.x = Math.PI / 2;

            console.log(scaledRadius, scaledDistance, color);
            scene.add(orbitPath);

            return { planet, pivot, period, name };
        };

        const planets = systemData.allExo.map(createPlanet).filter(p => p !== null);

        // Camera position and rotation
        const distance = 30;
        const angle = 30 * (Math.PI / 180); // Convert 30 degrees to radians
        camera.position.set(0, Math.sin(angle) * distance, Math.cos(angle) * distance);
        camera.lookAt(scene.position);

        // OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Raycaster for planet selection
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseClick = (event: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(planets.map(p => p.planet));

            if (intersects.length > 0) {
                const clickedPlanet = intersects[0].object;
                const selectedPlanet = systemData.allExo.find(p => p.name === clickedPlanet.userData.name);
                setSelectedPlanet(exoplanets[selectedPlanet!.name]);
                landingSound.play();
            } else {
                setSelectedPlanet(undefined);
            }
        };

        renderer.domElement.addEventListener('click', onMouseClick);

        // Animation
        const animate = () => {
            requestAnimationFrame(animate);

            planets.forEach(planet => {
                if (!planet) return;
                const { pivot, period } = planet;
                const speed = 0.01 / (period || 1);
                pivot.rotation.y += speed;
            });

            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            const { width, height } = currentMount.getBoundingClientRect();
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.domElement.removeEventListener('click', onMouseClick);
            currentMount.removeChild(renderer.domElement);
        };
    }, [systemData]);

    const handleRedirect = (planet: ExoplanetDetail) => {
        const SERVER = 'https://9e8d4b9f1ed5.ngrok.app/';
        const with_params = `${SERVER}/?name=${planet.name}`

        window.open(encodeURI(with_params), '_blank');
    }

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
            <button
                onClick={() => { exitSound.play(); onClose(); }}
                style={{
                    // position: 'relative',
                    top: '0',
                    left: '50%',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                {systemData.name} System
            </button>
            {selectedPlanet && (
                <div style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '10px'
                }}>
                    <button
                        onClick={() => setSelectedPlanet(undefined)}
                        style={{
                            position: 'sticky',
                            top: '5px',
                            right: '5px',
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={24} />
                    </button>
                    <h3>{selectedPlanet.name}</h3>
                    <p>Radius: {format(selectedPlanet.radius)} Earth radii</p>
                    <p>Period: {format(selectedPlanet.period)} days</p>
                    <p>Distance from star: {format(systemData.allExo.find(p => p.name == selectedPlanet.name)?.dist_from_star)} AU</p>
                    <button onClick={() => handleRedirect(selectedPlanet)}>
                        Visit this planet!
                    </button>
                </div>
            )}
            <button
                onClick={() => { exitSound.play(); onClose(); }}
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Back to Solar Systems
            </button>
        </div>
    );
};

export default Orrery;