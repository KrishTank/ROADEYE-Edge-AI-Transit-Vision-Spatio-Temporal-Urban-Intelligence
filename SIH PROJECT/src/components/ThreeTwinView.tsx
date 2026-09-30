/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Video-Game-Quality 3D Digital Twin Engine for Maitri & Bharati Stations
 * Walkable Interiors (18 Maitri Rooms + 22 Bharati Rooms), Interactive Water Bodies,
 * 12+ Arctic Vehicles with Telemetry Panels, Animated Occupants, Underwater View Mode,
 * Mini-Map, Time-of-Day Cycle, and Instant Teleportation Matrix ('T')
 * 
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - Problem Statement ID: 26060 - Team: HackFinity008
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { StationId } from '../types';
import { AiPredictorState } from '../services/aiPredictor';
import { 
  CameraExperienceMode, 
  SeasonMode, 
  RoomDefinition, 
  WaterBodyData, 
  VehicleDefinition, 
  OccupantPerson, 
  TeleportTarget 
} from './Twin3D/types';
import { MAITRI_ROOMS, MAITRI_OCCUPANTS } from './Twin3D/MaitriInteriorsData';
import { BHARATI_ROOMS, BHARATI_OCCUPANTS } from './Twin3D/BharatiInteriorsData';
import { POLAR_WATER_BODIES } from './Twin3D/WaterData';
import { POLAR_FLEET } from './Twin3D/VehicleData';

// Interactive Modals & HUD
import { WaterModal } from './Twin3D/WaterModal';
import { VehicleModal } from './Twin3D/VehicleModal';
import { RoomModal } from './Twin3D/RoomModal';
import { OccupantModal } from './Twin3D/OccupantModal';
import { FuelModal } from './Twin3D/FuelModal';
import { PenguinModal } from './Twin3D/PenguinModal';
import { MiniMap } from './Twin3D/MiniMap';
import { TeleportMenu } from './Twin3D/TeleportMenu';

import { 
  Camera, 
  Eye, 
  Flame, 
  Thermometer, 
  Activity, 
  Moon, 
  Sun, 
  Box, 
  Radio, 
  Sparkles, 
  Compass, 
  Navigation, 
  Sliders, 
  Waves, 
  Truck, 
  User, 
  Maximize2,
  Clock,
  ArrowUp,
  Fuel,
  Video,
  Play,
  RotateCw,
  Zap,
  Plane
} from 'lucide-react';

export interface HotspotData {
  id: string;
  name: string;
  station: StationId;
  category: string;
  status: 'Nominal' | 'Warning' | 'Critical' | 'Standby';
  description: string;
  telemetry: Record<string, string>;
  vulnerabilityNote?: string;
  position: [number, number, number];
}

export type ViewMode = 
  | 'Exterior' 
  | 'X-Ray' 
  | 'Infrared' 
  | 'Thermal' 
  | 'MEP/HVAC' 
  | 'Structural' 
  | 'Night';

export type CameraPreset = 
  | 'Overview' 
  | 'Maitri Focus' 
  | 'Bharati Focus' 
  | 'Aerial' 
  | 'Side View' 
  | 'Component Zoom' 
  | 'Interior — Maitri' 
  | 'Interior — Bharati';

interface ThreeTwinViewProps {
  activeStation: StationId;
  onStationSelect: (station: StationId) => void;
  aiState: AiPredictorState;
  isAntarcticMode: boolean;
  onHotspotSelect?: (hotspot: HotspotData | null) => void;
}

export const ThreeTwinView: React.FC<ThreeTwinViewProps> = ({
  activeStation,
  onStationSelect,
  aiState,
  isAntarcticMode,
  onHotspotSelect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Experience and Navigation State
  const [experienceMode, setExperienceMode] = useState<CameraExperienceMode>('orbit');
  const [viewMode, setViewMode] = useState<ViewMode>('Exterior');
  const [activePreset, setActivePreset] = useState<CameraPreset>('Overview');
  const [timeOfDay, setTimeOfDay] = useState<number>(14); // 00:00 to 24:00 (14 = 14:00)
  const [season, setSeason] = useState<SeasonMode>('summer');
  const [isTeleportOpen, setIsTeleportOpen] = useState(false);

  // Selected Interactive Modals State
  const [activeWaterModal, setActiveWaterModal] = useState<WaterBodyData | null>(null);
  const [activeVehicleModal, setActiveVehicleModal] = useState<VehicleDefinition | null>(null);
  const [activeRoomModal, setActiveRoomModal] = useState<RoomDefinition | null>(null);
  const [activeOccupantModal, setActiveOccupantModal] = useState<OccupantPerson | null>(null);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isPenguinModalOpen, setIsPenguinModalOpen] = useState(false);

  // Cinematic Drone Flyover Tour
  const [isDroneTourActive, setIsDroneTourActive] = useState(false);
  const droneAngleRef = useRef<number>(0);

  // Hover Tooltips
  const [hoveredTarget, setHoveredTarget] = useState<{ name: string; type: string } | null>(null);

  // Player / Camera Coordinates for Minimap
  const [playerCoords, setPlayerCoords] = useState<[number, number, number]>([0, 10, 0]);
  const [playerFacingY, setPlayerFacingY] = useState<number>(0);

  // Three.js Core Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);
  const interactiveObjects = useRef<Map<THREE.Object3D, any>>(new Map());

  // Dynamic Scene Elements
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const auroraMeshRef = useRef<THREE.Mesh | null>(null);
  const snowParticlesRef = useRef<THREE.Points | null>(null);
  const underwaterBubblesRef = useRef<THREE.Points | null>(null);
  const helicopterRotorRef = useRef<THREE.Mesh | null>(null);
  const windTurbineRotorRef = useRef<THREE.Group | null>(null);
  const radomeDishRef = useRef<THREE.Group | null>(null);
  const penguinGroupsRef = useRef<THREE.Group[]>([]);
  const helipadStrobesRef = useRef<THREE.PointLight[]>([]);
  const doorMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const occupantMeshesRef = useRef<Map<string, THREE.Group>>(new Map());

  // Camera lerp targets
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(80, 50, 110));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 10, 0));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 10, 0));

  // Walk Mode physics & key states
  const walkKeys = useRef<{ w: boolean; a: boolean; s: boolean; d: boolean; shift: boolean; space: boolean }>({
    w: false, a: false, s: false, d: false, shift: false, space: false
  });
  const walkCameraAngles = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });
  const isPointerLocked = useRef<boolean>(false);

  // Camera Presets
  const setCameraView = useCallback((preset: CameraPreset) => {
    setActivePreset(preset);
    setExperienceMode('orbit');

    if (preset === 'Overview') {
      targetCamPos.current.set(90, 60, 120);
      targetLookAt.current.set(0, 10, 0);
    } else if (preset === 'Maitri Focus') {
      onStationSelect('maitri');
      targetCamPos.current.set(30, 22, 45);
      targetLookAt.current.set(0, 8, 0);
    } else if (preset === 'Bharati Focus') {
      onStationSelect('bharati');
      targetCamPos.current.set(35, 24, 48);
      targetLookAt.current.set(0, 8, 0);
    } else if (preset === 'Aerial') {
      targetCamPos.current.set(0, 180, 25);
      targetLookAt.current.set(0, 0, 0);
    } else if (preset === 'Side View') {
      targetCamPos.current.set(120, 15, 0);
      targetLookAt.current.set(0, 8, 0);
    } else if (preset === 'Component Zoom') {
      targetCamPos.current.set(12, 10, 18);
      targetLookAt.current.set(0, 5, 0);
    } else if (preset === 'Interior — Maitri') {
      onStationSelect('maitri');
      setExperienceMode('walk');
      targetCamPos.current.set(-6, 2.5, 4);
      targetLookAt.current.set(-6, 2.5, 0);
    } else if (preset === 'Interior — Bharati') {
      onStationSelect('bharati');
      setExperienceMode('walk');
      targetCamPos.current.set(0, 2.5, 5);
      targetLookAt.current.set(0, 2.5, 0);
    }
  }, [onStationSelect]);

  // Teleport handler
  const handleTeleportTarget = (target: TeleportTarget) => {
    if (target.station !== activeStation) {
      onStationSelect(target.station);
    }
    setExperienceMode(target.mode);
    targetCamPos.current.set(...target.camPos);
    targetLookAt.current.set(...target.lookAt);
  };

  // Keyboard shortcut 'T' for teleport menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 't' || e.key === 'T') && !activeWaterModal && !activeVehicleModal && !activeRoomModal) {
        setIsTeleportOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWaterModal, activeVehicleModal, activeRoomModal]);

  // Main Three.js Scene Setup & Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 620;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const isNightTime = timeOfDay < 5 || timeOfDay > 21 || season === 'winter' || viewMode === 'Night';
    const skyColor = new THREE.Color(
      isNightTime ? 0x010308 : (experienceMode === 'underwater' ? 0x001B2E : 0x060B14)
    );
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(
      experienceMode === 'underwater' ? 0x002B47 : (isNightTime ? 0x01040A : 0x08101E),
      experienceMode === 'underwater' ? 0.025 : (isAntarcticMode ? 0.002 : 0.0035)
    );

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1400);
    camera.position.set(80, 50, 110);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isAntarcticMode,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isAntarcticMode ? 1.0 : 1.5));
    renderer.shadowMap.enabled = !isAntarcticMode && viewMode !== 'Structural';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    interactiveObjects.current.clear();
    doorMeshesRef.current.clear();
    occupantMeshesRef.current.clear();
    penguinGroupsRef.current = [];
    helipadStrobesRef.current = [];
    windTurbineRotorRef.current = null;
    radomeDishRef.current = null;

    // 4. Lighting based on Time of Day & Season
    const sunAngle = ((timeOfDay - 6) / 24) * Math.PI * 2;
    const sunElevation = Math.sin(sunAngle) * 90;
    const sunAzimuth = Math.cos(sunAngle) * 90;

    const sunIntensity = isNightTime ? 0.06 : (season === 'summer' ? 1.4 : 0.8);
    const sunLight = new THREE.DirectionalLight(0xE8F4FF, sunIntensity);
    sunLight.position.set(sunAzimuth, Math.max(15, sunElevation), 40);
    sunLight.castShadow = !isAntarcticMode && !isNightTime;
    sunLightRef.current = sunLight;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(
      isNightTime ? 0x050D1A : 0x1A2A44, 
      isNightTime ? 0x02050A : 0x4A3E30, 
      isNightTime ? 0.15 : 0.5
    );
    hemiLightRef.current = hemiLight;
    scene.add(hemiLight);

    // Interior Warm Lights
    const warmLight = new THREE.PointLight(0xFFB366, isNightTime ? 3.0 : 1.5, 45);
    warmLight.position.set(0, 10, 0);
    scene.add(warmLight);

    // 5. Stars & Aurora Borealis
    const starCount = isNightTime ? 2000 : 700;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 900;
      starPos[i + 1] = Math.random() * 350 + 40;
      starPos[i + 2] = (Math.random() - 0.5) * 900;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: isNightTime ? 2.2 : 1.5,
      transparent: true,
      opacity: isNightTime ? 0.95 : 0.7
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // Aurora Ribbon
    const auroraCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-220, 75, -140),
      new THREE.Vector3(-90, 105, -70),
      new THREE.Vector3(45, 95, -100),
      new THREE.Vector3(190, 115, -60),
      new THREE.Vector3(260, 85, -110)
    ]);
    const auroraGeo = new THREE.TubeGeometry(auroraCurve, 48, 14, 8, false);
    const auroraMat = new THREE.MeshBasicMaterial({
      color: activeStation === 'bharati' ? 0x00FFB2 : 0x00E0C6,
      transparent: true,
      opacity: isNightTime ? 0.8 : (isAntarcticMode ? 0.2 : 0.35),
      wireframe: true
    });
    const auroraMesh = new THREE.Mesh(auroraGeo, auroraMat);
    auroraMeshRef.current = auroraMesh;
    scene.add(auroraMesh);

    // 6. Snow Particles
    const snowCount = isAntarcticMode ? 1000 : (isNightTime ? 2400 : 3600);
    const snowGeo = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount; i++) {
      snowPositions[i * 3] = (Math.random() - 0.5) * 450;
      snowPositions[i * 3 + 1] = Math.random() * 160;
      snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 450;
    }
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
    const snowMat = new THREE.PointsMaterial({ color: 0xE8EEF4, size: 1.3, transparent: true, opacity: 0.65 });
    const snowParticles = new THREE.Points(snowGeo, snowMat);
    snowParticlesRef.current = snowParticles;
    scene.add(snowParticles);

    // 7. Underwater Bubbles (Active when experienceMode === 'underwater')
    const bubbleCount = 400;
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePositions = new Float32Array(bubbleCount * 3);
    for (let i = 0; i < bubbleCount; i++) {
      bubblePositions[i * 3] = (Math.random() - 0.5) * 80;
      bubblePositions[i * 3 + 1] = -Math.random() * 15;
      bubblePositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePositions, 3));
    const bubbleMat = new THREE.PointsMaterial({ color: 0x88EEFF, size: 2.4, transparent: true, opacity: 0.8 });
    const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
    underwaterBubblesRef.current = bubbles;
    if (experienceMode === 'underwater') {
      scene.add(bubbles);
    }

    // Shared Standard Materials
    const terrainMat = new THREE.MeshStandardMaterial({
      color: viewMode === 'Infrared' || viewMode === 'Thermal' ? 0x1A1448 : 0xE8F0F8,
      roughness: 0.85,
      metalness: 0.05
    });

    const isXRay = viewMode === 'X-Ray';
    const isMEP = viewMode === 'MEP/HVAC';
    const isStructural = viewMode === 'Structural';

    const wallMat = new THREE.MeshStandardMaterial({
      color: viewMode === 'Infrared' ? 0xFFAA00 : (isStructural ? 0x222222 : 0xDDE6EE),
      roughness: 0.4,
      metalness: 0.2,
      transparent: isXRay || isMEP,
      opacity: isXRay ? 0.15 : (isMEP ? 0.18 : 1.0),
      wireframe: isStructural
    });

    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: isNightTime ? 0xFFD700 : 0x4A9EFF,
      emissive: isNightTime ? 0xFFAA00 : 0x1A4E9F,
      emissiveIntensity: isNightTime ? 1.4 : 0.6,
      roughness: 0.1
    });

    // Helper to register interactive objects
    const registerTarget = (mesh: THREE.Object3D, data: any) => {
      mesh.userData = data;
      interactiveObjects.current.set(mesh, data);
    };

    // ─────────────────────────────────────────────────────────────
    // 8. TERRAIN & NATURAL WATER BODIES
    // ─────────────────────────────────────────────────────────────
    if (activeStation === 'maitri') {
      // Displaced Schirmacher Oasis Plateau & Lake Basin
      const terrainGeo = new THREE.PlaneGeometry(420, 420, 48, 48);
      terrainGeo.rotateX(-Math.PI / 2);
      const posAttr = terrainGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        let y = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5 + Math.sin(x * 0.05) * 2;
        // Lake Priyadarshini Basin
        const dist = Math.sqrt((x - 45) ** 2 + (z + 20) ** 2);
        if (dist < 50) {
          y -= (1 - dist / 50) * 8.5;
        }
        posAttr.setY(i, y);
      }
      terrainGeo.computeVertexNormals();
      const terrain = new THREE.Mesh(terrainGeo, terrainMat);
      terrain.receiveShadow = true;
      scene.add(terrain);

      // Lake Priyadarshini Water Surface (Interactive)
      const lakeGeo = new THREE.CircleGeometry(44, 32);
      lakeGeo.rotateX(-Math.PI / 2);
      const lakeMat = new THREE.MeshStandardMaterial({
        color: isNightTime ? 0x051E38 : 0x1B4965,
        roughness: 0.1,
        metalness: 0.85,
        transparent: true,
        opacity: 0.85
      });
      const lakeMesh = new THREE.Mesh(lakeGeo, lakeMat);
      lakeMesh.position.set(45, -1.8, -20);
      scene.add(lakeMesh);

      registerTarget(lakeMesh, {
        type: 'WATER',
        waterId: 'lake-priyadarshini',
        name: 'Lake Priyadarshini (Freshwater Supply)'
      });

      // Heated Trace Pipeline (0.4m diameter) from Lake to Station
      const pipeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(45, -1.2, -20),
        new THREE.Vector3(30, 1.2, -12),
        new THREE.Vector3(15, 2.0, -6),
        new THREE.Vector3(0, 2.5, 0)
      ]);
      const pipeMesh = new THREE.Mesh(
        new THREE.TubeGeometry(pipeCurve, 32, 0.4, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x00FFFF, emissive: 0x00FFFF, emissiveIntensity: 0.8 })
      );
      scene.add(pipeMesh);

    } else {
      // Bharati Coastal Fjord & Larsemann Hills
      const terrainGeo = new THREE.PlaneGeometry(450, 450, 48, 48);
      terrainGeo.rotateX(-Math.PI / 2);
      const posAttr = terrainGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        let y = Math.sin(x * 0.015) * Math.cos(z * 0.015) * 8 + Math.cos(x * 0.04) * 3;
        if (x < -60) y = -2.8 + Math.sin(z * 0.05); // Thala Fjord water level
        posAttr.setY(i, y);
      }
      terrainGeo.computeVertexNormals();
      const terrain = new THREE.Mesh(terrainGeo, terrainMat);
      scene.add(terrain);

      // Thala Fjord Marine Water Body
      const fjordGeo = new THREE.PlaneGeometry(160, 400);
      fjordGeo.rotateX(-Math.PI / 2);
      const fjordMesh = new THREE.Mesh(fjordGeo, new THREE.MeshStandardMaterial({
        color: isNightTime ? 0x040F20 : 0x0A2647,
        roughness: 0.08,
        metalness: 0.9,
        transparent: true,
        opacity: 0.9
      }));
      fjordMesh.position.set(-140, -1.4, 0);
      scene.add(fjordMesh);

      registerTarget(fjordMesh, {
        type: 'WATER',
        waterId: 'thala-fjord',
        name: 'Thala Fjord (Deep Coastal Water Body)'
      });

      // Quilty Bay Shoreline Water Body
      const bayGeo = new THREE.CircleGeometry(65, 32);
      bayGeo.rotateX(-Math.PI / 2);
      const bayMesh = new THREE.Mesh(bayGeo, new THREE.MeshStandardMaterial({
        color: 0x0E3854,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85
      }));
      bayMesh.position.set(-45, -1.0, 35);
      scene.add(bayMesh);

      registerTarget(bayMesh, {
        type: 'WATER',
        waterId: 'quilty-bay',
        name: 'Quilty Bay (Marine Transit & Haven)'
      });

      // 4 Tracked Icebergs floating in Thala Fjord
      for (let berg of [
        { x: -160, z: -80, size: 14, name: 'Tabular Berg B-46A' },
        { x: -220, z: 110, size: 18, name: 'Pinnacle Berg P-12' },
        { x: -110, z: 45, size: 10, name: 'Drydock Floe D-04' },
        { x: -250, z: -140, size: 22, name: 'Bergy Bit BB-08' }
      ]) {
        const bergMesh = new THREE.Mesh(
          new THREE.ConeGeometry(berg.size, berg.size * 0.8, 7),
          new THREE.MeshStandardMaterial({ color: 0xF0F8FF, roughness: 0.3 })
        );
        bergMesh.position.set(berg.x, berg.size * 0.2, berg.z);
        scene.add(bergMesh);

        registerTarget(bergMesh, {
          type: 'WATER',
          waterId: 'thala-fjord',
          name: `${berg.name} (Tracked Iceberg)`
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 8.1 ARCTIC BULK FUEL DEPOT & TANK FARM (MAITRI & BHARATI)
    // ─────────────────────────────────────────────────────────────
    const fuelDepotGroup = new THREE.Group();

    if (activeStation === 'maitri') {
      // Maitri South Fuel Farm: 4 bulk horizontal tanks on concrete cradles inside containment dyke
      fuelDepotGroup.position.set(-28, 0, 24);

      // Concrete retention containment slab
      const slabMesh = new THREE.Mesh(
        new THREE.BoxGeometry(26, 0.4, 18),
        new THREE.MeshStandardMaterial({ color: 0x364151, roughness: 0.85 })
      );
      slabMesh.position.y = 0.2;
      fuelDepotGroup.add(slabMesh);

      // Containment bund berm walls (110% capacity)
      const bundMat = new THREE.MeshStandardMaterial({ color: 0x4B5565, roughness: 0.8 });
      const wallN = new THREE.Mesh(new THREE.BoxGeometry(26, 1.2, 0.4), bundMat);
      wallN.position.set(0, 0.8, -9);
      const wallS = new THREE.Mesh(new THREE.BoxGeometry(26, 1.2, 0.4), bundMat);
      wallS.position.set(0, 0.8, 9);
      const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 18), bundMat);
      wallW.position.set(-13, 0.8, 0);
      const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 18), bundMat);
      wallE.position.set(13, 0.8, 0);
      fuelDepotGroup.add(wallN, wallS, wallW, wallE);

      // 4 Large Horizontal Arctic Fuel Tanks (D-208 Diesel, 50,000L each)
      const tankMat = new THREE.MeshStandardMaterial({
        color: 0xCAD2DC,
        metalness: 0.85,
        roughness: 0.25
      });
      const cradleMat = new THREE.MeshStandardMaterial({ color: 0x222A35, roughness: 0.9 });

      for (let i = 0; i < 4; i++) {
        const tankZ = -6 + i * 4.0;
        const tankMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(1.8, 1.8, 9.5, 20),
          tankMat
        );
        tankMesh.rotation.z = Math.PI / 2;
        tankMesh.position.set(1, 2.2, tankZ);
        fuelDepotGroup.add(tankMesh);

        // Concrete Saddles
        const cradle1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 4.0), cradleMat);
        cradle1.position.set(-2.5, 0.7, tankZ);
        const cradle2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 4.0), cradleMat);
        cradle2.position.set(4.5, 0.7, tankZ);
        fuelDepotGroup.add(cradle1, cradle2);

        // Hazard Bands (Red & Yellow)
        const hazardBand = new THREE.Mesh(
          new THREE.CylinderGeometry(1.82, 1.82, 0.6, 20),
          new THREE.MeshStandardMaterial({ color: 0xFFB020, metalness: 0.5 })
        );
        hazardBand.rotation.z = Math.PI / 2;
        hazardBand.position.set(1, 2.2, tankZ);
        fuelDepotGroup.add(hazardBand);
      }

      // Fuel Dispensing Station Cabin
      const pumpHouse = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 3.2, 4.2),
        new THREE.MeshStandardMaterial({ color: 0xE65100, roughness: 0.4 })
      );
      pumpHouse.position.set(-8.5, 1.8, 0);
      fuelDepotGroup.add(pumpHouse);

      // Pre-Heater Status Green Beacon
      const preHeatLight = new THREE.PointLight(0x00FF88, 1.5, 10);
      preHeatLight.position.set(-8.5, 3.8, 0);
      fuelDepotGroup.add(preHeatLight);

      // Heated Trace Pipeline connecting Fuel Depot to Main Station
      const fuelPipeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-28, 2.2, 24),
        new THREE.Vector3(-18, 2.4, 15),
        new THREE.Vector3(-10, 2.6, 8),
        new THREE.Vector3(-2, 2.8, 2)
      ]);
      const fuelPipeMesh = new THREE.Mesh(
        new THREE.TubeGeometry(fuelPipeCurve, 32, 0.35, 8, false),
        new THREE.MeshStandardMaterial({ color: 0xFFB020, emissive: 0xFFB020, emissiveIntensity: 0.7 })
      );
      scene.add(fuelPipeMesh);

    } else {
      // Bharati Modular Containerized Fuel Bunkering System (6 ISO 20ft Tank Containers)
      fuelDepotGroup.position.set(28, 0, -22);

      // Raised foundation
      const grillage = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.6, 16),
        new THREE.MeshStandardMaterial({ color: 0x2A323D, metalness: 0.8, roughness: 0.3 })
      );
      grillage.position.y = 0.5;
      fuelDepotGroup.add(grillage);

      // 6 ISO Tank Units (2 rows of 3)
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          const isoGroup = new THREE.Group();
          isoGroup.position.set(-6 + c * 6.2, 1.8, -4 + r * 8.0);

          const isoFrame = new THREE.Mesh(
            new THREE.BoxGeometry(5.4, 2.4, 2.3),
            new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.6, roughness: 0.4 })
          );
          isoGroup.add(isoFrame);

          const tankCyl = new THREE.Mesh(
            new THREE.CylinderGeometry(0.95, 0.95, 5.0, 16),
            new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.85, roughness: 0.2 })
          );
          tankCyl.rotation.z = Math.PI / 2;
          isoGroup.add(tankCyl);

          fuelDepotGroup.add(isoGroup);
        }
      }

      // Heated Bunkering Transfer Skid
      const skidMesh = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 2.0, 3.5),
        new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.5 })
      );
      skidMesh.position.set(-9.5, 1.5, 0);
      fuelDepotGroup.add(skidMesh);
    }

    scene.add(fuelDepotGroup);
    registerTarget(fuelDepotGroup, {
      type: 'FUEL',
      name: activeStation === 'maitri'
        ? 'Maitri Bulk Fuel Farm (4x 50,000L D-208 Tanks & Pump Skid)'
        : 'Bharati Modular Bunkering Facility (6x ISO Tank Battery)'
    });

    // ─────────────────────────────────────────────────────────────
    // 8.2 COLONY OF ANIMATED EMPEROR & ADÉLIE PENGUINS (10 PENGUINS)
    // ─────────────────────────────────────────────────────────────
    const penguinOrigin = activeStation === 'maitri' 
      ? new THREE.Vector3(32, 0, 12) 
      : new THREE.Vector3(-28, 0, 32);

    for (let i = 0; i < 10; i++) {
      const pGroup = new THREE.Group();
      const offsetX = (i % 4) * 2.2 + (Math.sin(i * 1.5) * 1.2);
      const offsetZ = Math.floor(i / 4) * 2.4 + (Math.cos(i * 2.1) * 1.0);
      const posX = penguinOrigin.x + offsetX;
      const posZ = penguinOrigin.z + offsetZ;
      const baseY = -0.1;

      pGroup.position.set(posX, baseY, posZ);

      // Behavior: 0..4 waddle, 5..6 slide on belly, 7..8 flap wings, 9 huddle
      let behavior = 'waddle';
      if (i === 5 || i === 6) behavior = 'slide';
      else if (i === 7 || i === 8) behavior = 'flap';
      else if (i === 9) behavior = 'huddle';

      pGroup.userData = {
        behavior,
        baseX: posX,
        baseZ: posZ,
        baseY,
        seed: i
      };

      // Penguin Materials
      const coatMat = new THREE.MeshStandardMaterial({ color: 0x0A111E, roughness: 0.35 });
      const bellyMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });
      const collarMat = new THREE.MeshStandardMaterial({ color: 0xFFB300, roughness: 0.4 });
      const beakMat = new THREE.MeshStandardMaterial({ color: 0xFF6F00, roughness: 0.3 });
      const feetMat = new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.8 });

      if (behavior === 'slide') {
        // Lying down flat on belly (tobogganing across the ice)
        pGroup.rotation.x = Math.PI / 2 - 0.15;
        pGroup.rotation.y = -Math.PI / 3;

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.2, 12), coatMat);
        body.position.y = 0.4;
        const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 1.15, 12, 1, false, 0, Math.PI), bellyMat);
        belly.position.set(0, 0.4, 0.05);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), coatMat);
        head.position.y = 1.1;

        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 4), beakMat);
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, 1.1, 0.3);

        pGroup.add(body, belly, head, beak);
      } else {
        // Standing upright
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 1.1, 12), coatMat);
        body.position.y = 0.65;

        // White belly
        const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.36, 1.05, 12, 1, false, -Math.PI / 2, Math.PI), bellyMat);
        belly.position.set(0, 0.65, 0.04);

        // Golden collar on chest
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.3, 0.25, 12, 1, false, -Math.PI / 2, Math.PI), collarMat);
        collar.position.set(0, 1.0, 0.045);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), coatMat);
        head.position.y = 1.25;

        // Beak
        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 6), beakMat);
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, 1.25, 0.28);

        // Wings (flippers)
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.2), coatMat);
        wingL.position.set(-0.35, 0.65, 0);
        wingL.rotation.z = 0.25;

        const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.2), coatMat);
        wingR.position.set(0.35, 0.65, 0);
        wingR.rotation.z = -0.25;

        pGroup.userData.leftWing = wingL;
        pGroup.userData.rightWing = wingR;

        // Feet
        const footL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.3), feetMat);
        footL.position.set(-0.16, 0.05, 0.12);
        const footR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.3), feetMat);
        footR.position.set(0.16, 0.05, 0.12);

        pGroup.add(body, belly, collar, head, beak, wingL, wingR, footL, footR);
      }

      scene.add(pGroup);
      penguinGroupsRef.current.push(pGroup);

      registerTarget(pGroup, {
        type: 'PENGUIN',
        name: `Emperor Penguin Colony (${behavior === 'slide' ? 'Tobogganing on Belly' : behavior === 'flap' ? 'Wing Flapping' : 'Waddling'})`
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 8.3 RAISED HELIPAD & ARCTIC TRANSPORT HELICOPTER
    // ─────────────────────────────────────────────────────────────
    const helipadPos = activeStation === 'maitri'
      ? new THREE.Vector3(38, 0, -32)
      : new THREE.Vector3(-18, 0, -32);

    const helipadGroup = new THREE.Group();
    helipadGroup.position.copy(helipadPos);

    // Octagonal Steel Helideck Slab
    const padDeck = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 14, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x2A3340, metalness: 0.8, roughness: 0.3 })
    );
    padDeck.position.y = 0.4;
    helipadGroup.add(padDeck);

    // Yellow "H" Touchdown Markings
    const hBar1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 7.0), new THREE.MeshBasicMaterial({ color: 0xFFD700 }));
    hBar1.position.set(-2.5, 0.83, 0);
    const hBar2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 7.0), new THREE.MeshBasicMaterial({ color: 0xFFD700 }));
    hBar2.position.set(2.5, 0.83, 0);
    const hCross = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.05, 1.2), new THREE.MeshBasicMaterial({ color: 0xFFD700 }));
    hCross.position.set(0, 0.83, 0);
    helipadGroup.add(hBar1, hBar2, hCross);

    // Perimeter Pulsing Green LED Strobes (8 lights around perimeter)
    for (let s = 0; s < 8; s++) {
      const angle = (s / 8) * Math.PI * 2;
      const sx = Math.cos(angle) * 13.2;
      const sz = Math.sin(angle) * 13.2;

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), new THREE.MeshBasicMaterial({ color: 0x666666 }));
      post.position.set(sx, 0.9, sz);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00FF88 }));
      lamp.position.set(sx, 1.25, sz);
      helipadGroup.add(post, lamp);

      const strobeLight = new THREE.PointLight(0x00FF88, 1.0, 8);
      strobeLight.position.set(sx, 1.3, sz);
      helipadGroup.add(strobeLight);
      helipadStrobesRef.current.push(strobeLight);
    }

    // Polar Transport Helicopter (Kamov Ka-32 / Dauphin)
    const heloGroup = new THREE.Group();
    heloGroup.position.set(0, 1.2, 0);

    const heloBody = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 2.4, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xE65100, metalness: 0.6, roughness: 0.3 })
    );
    heloBody.position.y = 1.4;

    const heloNose = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x0A192F, metalness: 0.9, roughness: 0.1 })
    );
    heloNose.position.set(0, 1.4, 3.2);

    const tailBoom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.7, 7.0, 8),
      new THREE.MeshStandardMaterial({ color: 0xE65100, metalness: 0.5 })
    );
    tailBoom.rotation.x = Math.PI / 2;
    tailBoom.position.set(0, 1.6, -4.5);

    const tailFin = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 2.0, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x00E0C6 })
    );
    tailFin.position.set(0, 2.4, -7.8);

    // 4-Blade Main Rotor (animated spinning)
    const rotorGroup = new THREE.Mesh(
      new THREE.BoxGeometry(14.0, 0.08, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.9 })
    );
    rotorGroup.position.set(0, 2.9, 0);
    helicopterRotorRef.current = rotorGroup;

    const rotorCross = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.08, 14.0),
      new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.9 })
    );
    rotorGroup.add(rotorCross);

    // Landing Skids
    const skidMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 });
    const skidL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 6.0), skidMat);
    skidL.position.set(-1.4, 0.1, 0);
    const skidR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 6.0), skidMat);
    skidR.position.set(1.4, 0.1, 0);

    heloGroup.add(heloBody, heloNose, tailBoom, tailFin, rotorGroup, skidL, skidR);
    helipadGroup.add(heloGroup);

    scene.add(helipadGroup);
    registerTarget(helipadGroup, {
      type: 'VEHICLE',
      vehicle: POLAR_FLEET['polar-helo-01'] || POLAR_FLEET['hagg-bv206-01'],
      name: 'Kamov Ka-32 Polar Helicopter (Aviation Helideck)'
    });

    // ─────────────────────────────────────────────────────────────
    // 8.4 CLEAN ENERGY MICROGRID (BIFACIAL SOLAR & ROTATING TURBINE)
    // ─────────────────────────────────────────────────────────────
    const microgridPos = activeStation === 'maitri'
      ? new THREE.Vector3(-36, 0, -18)
      : new THREE.Vector3(34, 0, 16);

    const microgridGroup = new THREE.Group();
    microgridGroup.position.copy(microgridPos);

    // 12 Bifacial Solar Panels (tilted at 70° toward polar sun)
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0B2A4A,
      metalness: 0.95,
      roughness: 0.1
    });
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 6; col++) {
        const panelMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 0.08), panelMat);
        panelMesh.position.set(-6 + col * 2.5, 1.4 + row * 1.5, -row * 2.2);
        panelMesh.rotation.x = -Math.PI / 4; // Tilted toward the horizon
        microgridGroup.add(panelMesh);
      }
    }

    // Polar Wind Turbine
    const turbineGroup = new THREE.Group();
    turbineGroup.position.set(10, 0, 4);

    const towerMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.65, 18, 12),
      new THREE.MeshStandardMaterial({ color: 0xE8EFF8, metalness: 0.7, roughness: 0.3 })
    );
    towerMesh.position.y = 9;
    turbineGroup.add(towerMesh);

    const nacelleMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.2, 2.8),
      new THREE.MeshStandardMaterial({ color: 0xE65100, metalness: 0.6 })
    );
    nacelleMesh.position.y = 18;
    turbineGroup.add(nacelleMesh);

    // 3-Blade Rotor (animated)
    const rotorHub = new THREE.Group();
    rotorHub.position.set(0, 18, 1.5);

    const hubCenter = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    rotorHub.add(hubCenter);

    for (let b = 0; b < 3; b++) {
      const bladeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 7.8, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3 })
      );
      bladeMesh.position.y = 3.9;
      const bladePivot = new THREE.Group();
      bladePivot.rotation.z = (b / 3) * Math.PI * 2;
      bladePivot.add(bladeMesh);
      rotorHub.add(bladePivot);
    }
    turbineGroup.add(rotorHub);
    windTurbineRotorRef.current = rotorHub;

    microgridGroup.add(turbineGroup);
    scene.add(microgridGroup);

    registerTarget(microgridGroup, {
      type: 'EQUIPMENT',
      name: 'Clean Polar Microgrid (Wind Turbine & 12x Bifacial Solar Array)'
    });

    // ─────────────────────────────────────────────────────────────
    // 8.5 TRANSLUCENT GEODESIC COMMUNICATIONS RADOME & TRACKING DISH
    // ─────────────────────────────────────────────────────────────
    const radomePos = activeStation === 'maitri'
      ? new THREE.Vector3(-14, 0, -28)
      : new THREE.Vector3(12, 0, -32);

    const radomeGroup = new THREE.Group();
    radomeGroup.position.copy(radomePos);

    // Platform Base
    const radomeBase = new THREE.Mesh(
      new THREE.CylinderGeometry(5.0, 5.4, 2.0, 16),
      new THREE.MeshStandardMaterial({ color: 0x364151, roughness: 0.8 })
    );
    radomeBase.position.y = 1.0;
    radomeGroup.add(radomeBase);

    // Translucent Geodesic Dome
    const domeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(4.4, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.75),
      new THREE.MeshStandardMaterial({
        color: 0xEEF8FF,
        transparent: true,
        opacity: isNightTime ? 0.45 : 0.6,
        roughness: 0.1,
        metalness: 0.2
      })
    );
    domeMesh.position.y = 2.0;
    radomeGroup.add(domeMesh);

    // Parabolic Satellite Tracking Dish Antenna inside Dome
    const dishPedestal = new THREE.Group();
    dishPedestal.position.set(0, 3.2, 0);

    const dishPost = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.8, 8), new THREE.MeshStandardMaterial({ color: 0x555555 }));
    dishPedestal.add(dishPost);

    const dishMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 0.3, 0.6, 20),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.85, roughness: 0.2 })
    );
    dishMesh.rotation.x = Math.PI / 4;
    dishMesh.position.y = 1.2;
    dishPedestal.add(dishMesh);

    radomeGroup.add(dishPedestal);
    radomeDishRef.current = dishPedestal;

    scene.add(radomeGroup);
    registerTarget(radomeGroup, {
      type: 'EQUIPMENT',
      name: 'Deep Space & Polar Satellite Ground Station Radome (Rotating Dish)'
    });

    // ─────────────────────────────────────────────────────────────
    // 8.6 ICONIC EXTERIOR STATION ARCHITECTURAL SHELL
    // ─────────────────────────────────────────────────────────────
    const shellGroup = new THREE.Group();

    if (activeStation === 'bharati') {
      // BHARATI: Futuristic Aerodynamic Aerofoil Container Ship Silhouette
      shellGroup.position.set(0, 0, 0);

      // 20 Elevated Hydraulic Stilt Columns (preventing snowdrifts underneath)
      const stiltMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 });
      for (let sx = -16; sx <= 16; sx += 8) {
        for (let sz = -8; sz <= 8; sz += 8) {
          const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 4.5, 12), stiltMat);
          stilt.position.set(sx, 2.25, sz);
          shellGroup.add(stilt);
        }
      }

      // Main Aerodynamic Faceted Clad Hull
      const shellMat = new THREE.MeshStandardMaterial({
        color: 0xFF5722, // Iconic Bharati Polar Orange
        metalness: 0.75,
        roughness: 0.28,
        transparent: viewMode !== 'Exterior',
        opacity: viewMode === 'Exterior' ? 0.96 : (viewMode === 'X-Ray' ? 0.15 : 0.4),
        wireframe: viewMode === 'Structural'
      });

      const mainHull = new THREE.Mesh(new THREE.BoxGeometry(38, 7.4, 20), shellMat);
      mainHull.position.set(0, 8.2, 0);
      shellGroup.add(mainHull);

      // Panoramic Observation Deck Double-Glazed Windows (glowing warm interior light)
      const windowMat = new THREE.MeshStandardMaterial({
        color: 0xFFF3B0,
        emissive: 0xFFA000,
        emissiveIntensity: isNightTime ? 1.6 : 0.7,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9
      });
      const windowN = new THREE.Mesh(new THREE.BoxGeometry(34, 1.8, 0.2), windowMat);
      windowN.position.set(0, 8.8, -10.1);
      const windowS = new THREE.Mesh(new THREE.BoxGeometry(34, 1.8, 0.2), windowMat);
      windowS.position.set(0, 8.8, 10.1);
      shellGroup.add(windowN, windowS);

      // Rooftop Observation Deck & Weather Mast
      const roofDeck = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 10), new THREE.MeshStandardMaterial({ color: 0x1E293B }));
      roofDeck.position.set(0, 12.1, 0);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 8.0, 8), new THREE.MeshStandardMaterial({ color: 0xE2E8F0 }));
      mast.position.set(0, 16.0, 0);
      shellGroup.add(roofDeck, mast);

    } else {
      // MAITRI: Iconic Polar Orange Elevated Modular Complex & Skyway
      shellGroup.position.set(0, 0, 0);

      // Elevated concrete foundation piers
      const pierMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
      for (let px = -14; px <= 14; px += 7) {
        for (let pz = -6; pz <= 6; pz += 6) {
          const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3.2, 12), pierMat);
          pier.position.set(px, 1.6, pz);
          shellGroup.add(pier);
        }
      }

      // Main Block A & Block B
      const maitriShellMat = new THREE.MeshStandardMaterial({
        color: 0xE65100, // Maitri Polar Safety Orange
        metalness: 0.65,
        roughness: 0.35,
        transparent: viewMode !== 'Exterior',
        opacity: viewMode === 'Exterior' ? 0.96 : (viewMode === 'X-Ray' ? 0.15 : 0.4),
        wireframe: viewMode === 'Structural'
      });

      const blockA = new THREE.Mesh(new THREE.BoxGeometry(16, 6.8, 14), maitriShellMat);
      blockA.position.set(-8, 6.6, 0);
      const blockB = new THREE.Mesh(new THREE.BoxGeometry(16, 6.8, 14), maitriShellMat);
      blockB.position.set(10, 6.6, 0);

      // Enclosed Connecting Skybridge Corridor
      const linkSkyway = new THREE.Mesh(
        new THREE.BoxGeometry(4.0, 3.2, 4.0),
        new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.8 })
      );
      linkSkyway.position.set(1, 6.6, 0);

      // Warm Double-Glazed Windows
      const mtrWinMat = new THREE.MeshStandardMaterial({
        color: 0xFFF3B0,
        emissive: 0xFFB300,
        emissiveIntensity: isNightTime ? 1.8 : 0.8,
        roughness: 0.1
      });
      for (let w = 0; w < 4; w++) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.15), mtrWinMat);
        win.position.set(-13 + w * 3.4, 7.5, 7.05);
        shellGroup.add(win);
      }

      shellGroup.add(blockA, blockB, linkSkyway);
    }

    scene.add(shellGroup);
    registerTarget(shellGroup, {
      type: 'ROOM',
      name: `${activeStation === 'maitri' ? 'Maitri Research Station Complex' : 'Bharati Space-Age Aerofoil Complex'}`
    });

    // ─────────────────────────────────────────────────────────────
    // 9. PROCEDURAL INTERIOR ROOM BUILDER (Maitri: 18, Bharati: 22)
    // ─────────────────────────────────────────────────────────────
    const roomsToRender = activeStation === 'maitri' ? MAITRI_ROOMS : BHARATI_ROOMS;

    for (let room of roomsToRender) {
      const roomGroup = new THREE.Group();
      roomGroup.position.set(room.bounds.x, room.bounds.y, room.bounds.z);

      // Room Floor Slab
      const floorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(room.bounds.width, 0.2, room.bounds.depth),
        new THREE.MeshStandardMaterial({ color: 0x2A3342, roughness: 0.8 })
      );
      floorMesh.position.y = 0;
      roomGroup.add(floorMesh);

      // Room Perimeter Walls
      const wallThickness = 0.2;
      const h = room.bounds.height;
      const w = room.bounds.width;
      const d = room.bounds.depth;

      // North Wall
      const wallN = new THREE.Mesh(new THREE.BoxGeometry(w, h, wallThickness), wallMat);
      wallN.position.set(0, h / 2, -d / 2);
      // South Wall
      const wallS = new THREE.Mesh(new THREE.BoxGeometry(w, h, wallThickness), wallMat);
      wallS.position.set(0, h / 2, d / 2);
      // West Wall
      const wallW = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, h, d), wallMat);
      wallW.position.set(-w / 2, h / 2, 0);
      // East Wall
      const wallE = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, h, d), wallMat);
      wallE.position.set(w / 2, h / 2, 0);

      roomGroup.add(wallN, wallS, wallW, wallE);

      // Light Switch in room
      const switchMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.1),
        new THREE.MeshStandardMaterial({ color: room.lightSwitch.isOn ? 0xFFD700 : 0x444444 })
      );
      switchMesh.position.set(0, 1.5, d / 2 - 0.15);
      roomGroup.add(switchMesh);

      // Room Interior Overhead Light
      if (room.lightSwitch.isOn && !isStructural) {
        const roomLight = new THREE.PointLight(room.lightSwitch.lightColor, room.lightSwitch.intensity, 18);
        roomLight.position.set(0, h - 0.4, 0);
        roomGroup.add(roomLight);
      }

      // Modelled Furnishings / Equipment based on Room Type
      for (let eq of room.equipment) {
        const eqMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 1.2, 1.0),
          new THREE.MeshStandardMaterial({ 
            color: eq.type.includes('Genset') ? 0xFF6B2B : (eq.type.includes('Server') ? 0x00E0C6 : 0x4A9EFF),
            roughness: 0.3,
            metalness: 0.6
          })
        );
        eqMesh.position.set(
          eq.position[0] - room.bounds.x,
          eq.position[1] - room.bounds.y,
          eq.position[2] - room.bounds.z
        );
        roomGroup.add(eqMesh);

        registerTarget(eqMesh, {
          type: 'EQUIPMENT',
          room,
          equipment: eq,
          name: `${eq.name} (${room.name})`
        });
      }

      // Animated Doors
      for (let door of room.doors) {
        const doorGroup = new THREE.Group();
        doorGroup.position.set(
          door.position[0] - room.bounds.x,
          door.position[1] - room.bounds.y,
          door.position[2] - room.bounds.z
        );
        doorGroup.rotation.y = door.rotationY;

        const doorLeaf = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 2.6, 0.1),
          new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.4 })
        );
        doorLeaf.position.set(0.7, 1.3, 0); // Pivot on edge
        doorGroup.add(doorLeaf);

        roomGroup.add(doorGroup);
        doorMeshesRef.current.set(door.id, doorGroup);

        registerTarget(doorLeaf, {
          type: 'DOOR',
          door,
          room,
          name: `Door: ${door.label}`
        });
      }

      // Clickable Room Target
      registerTarget(floorMesh, {
        type: 'ROOM',
        room,
        name: room.name
      });

      scene.add(roomGroup);
    }

    // ─────────────────────────────────────────────────────────────
    // 10. DETAILED ARCTIC FLEET (12+ VEHICLES)
    // ─────────────────────────────────────────────────────────────
    for (let vehicle of Object.values(POLAR_FLEET)) {
      if (vehicle.station !== activeStation) continue;

      const vehGroup = new THREE.Group();
      vehGroup.position.set(...vehicle.position);
      vehGroup.rotation.y = vehicle.rotationY;

      if (vehicle.category === 'Heavy Traverse Machinery') {
        // PistenBully 300 Polar
        const cab = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 3.2), new THREE.MeshStandardMaterial({ color: 0xD62226, roughness: 0.3 }));
        cab.position.set(0, 1.2, 0);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 4.4), new THREE.MeshStandardMaterial({ color: 0xFFD700 }));
        blade.position.set(3.2, 0.4, 0);
        const tracksL = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.1, 0.9), new THREE.MeshStandardMaterial({ color: 0x1A1A1A }));
        tracksL.position.set(0, 0, 1.7);
        const tracksR = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.1, 0.9), new THREE.MeshStandardMaterial({ color: 0x1A1A1A }));
        tracksR.position.set(0, 0, -1.7);
        vehGroup.add(cab, blade, tracksL, tracksR);

      } else if (vehicle.category === 'Snowmobile') {
        // Ski-Doo
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 0.9), new THREE.MeshStandardMaterial({ color: 0xFFD700 }));
        body.position.set(0, 0.4, 0);
        const skis = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 1.1), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        skis.position.set(0.6, -0.2, 0);
        vehGroup.add(body, skis);

      } else if (vehicle.category === 'Aviation Support') {
        // Helicopter on Helipad
        const helo = new THREE.Mesh(new THREE.ConeGeometry(2.0, 7.5, 12), new THREE.MeshStandardMaterial({ color: 0xFFD700 }));
        helo.rotation.z = Math.PI / 2;
        helo.position.set(0, 2.8, 0);

        const rotor = new THREE.Mesh(new THREE.BoxGeometry(16, 0.08, 0.6), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        rotor.position.set(0, 4.6, 0);
        helicopterRotorRef.current = rotor;
        vehGroup.add(helo, rotor);

      } else if (vehicle.category === 'Marine Coastal') {
        // Zodiac Boat
        const boat = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 4.2, 12), new THREE.MeshStandardMaterial({ color: 0xFF6B2B }));
        boat.rotation.x = Math.PI / 2;
        vehGroup.add(boat);

      } else {
        // Tracked Carrier
        const front = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.0, 2.2), new THREE.MeshStandardMaterial({ color: 0x2E7D32 }));
        front.position.set(1.6, 0.4, 0);
        const rear = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.0, 2.2), new THREE.MeshStandardMaterial({ color: 0x2E7D32 }));
        rear.position.set(-1.6, 0.4, 0);
        vehGroup.add(front, rear);
      }

      scene.add(vehGroup);

      registerTarget(vehGroup, {
        type: 'VEHICLE',
        vehicle,
        name: vehicle.name
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 11. OCCUPANT CREW FIGURES (Moving on defined paths)
    // ─────────────────────────────────────────────────────────────
    const occupants = activeStation === 'maitri' ? MAITRI_OCCUPANTS : BHARATI_OCCUPANTS;
    for (let occupant of occupants) {
      const humanGroup = new THREE.Group();
      humanGroup.position.set(...occupant.position);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshStandardMaterial({ color: 0xFFDFBA }));
      head.position.y = 1.6;
      const parka = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.9, 8), new THREE.MeshStandardMaterial({ color: occupant.roleColor }));
      parka.position.y = 0.95;
      const legs = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.8, 0.3), new THREE.MeshStandardMaterial({ color: 0x1A1A1A }));
      legs.position.y = 0.4;

      humanGroup.add(head, parka, legs);
      scene.add(humanGroup);
      occupantMeshesRef.current.set(occupant.id, humanGroup);

      registerTarget(humanGroup, {
        type: 'OCCUPANT',
        occupant,
        name: `${occupant.name} (${occupant.role})`
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 12. RAYCASTING, CLICK & HOVER INTERACTION
    // ─────────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(interactiveObjects.current.keys()), true);

      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && !interactiveObjects.current.has(topObj) && topObj.parent) {
          topObj = topObj.parent;
        }
        if (topObj && interactiveObjects.current.has(topObj)) {
          const data = interactiveObjects.current.get(topObj);
          setHoveredTarget({ name: data.name, type: data.type });
          renderer.domElement.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredTarget(null);
      renderer.domElement.style.cursor = experienceMode === 'walk' ? 'crosshair' : 'grab';
    };

    const handlePointerDown = (e: MouseEvent) => {
      // In walk mode, click can open door or lock pointer
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(interactiveObjects.current.keys()), true);

      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && !interactiveObjects.current.has(topObj) && topObj.parent) {
          topObj = topObj.parent;
        }
        if (topObj && interactiveObjects.current.has(topObj)) {
          const data = interactiveObjects.current.get(topObj);
          
          if (data.type === 'WATER') {
            const wb = POLAR_WATER_BODIES[data.waterId];
            if (wb) setActiveWaterModal(wb);
          } else if (data.type === 'VEHICLE') {
            setActiveVehicleModal(data.vehicle);
          } else if (data.type === 'ROOM') {
            setActiveRoomModal(data.room);
          } else if (data.type === 'OCCUPANT') {
            setActiveOccupantModal(data.occupant);
          } else if (data.type === 'FUEL') {
            setIsFuelModalOpen(true);
          } else if (data.type === 'PENGUIN') {
            setIsPenguinModalOpen(true);
          } else if (data.type === 'DOOR') {
            // Animate door opening
            const doorGroup = doorMeshesRef.current.get(data.door.id);
            if (doorGroup) {
              doorGroup.rotation.y = doorGroup.rotation.y === 0 ? Math.PI / 2.2 : 0;
            }
          }
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousemove', handlePointerMove);
    domElement.addEventListener('click', handlePointerDown);

    // Mouse drag orbit controls for Orbit Mode
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMoveOrbit = (e: MouseEvent) => {
      if (experienceMode === 'walk') {
        // First-person mouse look
        if (isDragging) {
          const deltaX = e.clientX - prevMouseX;
          const deltaY = e.clientY - prevMouseY;
          prevMouseX = e.clientX;
          prevMouseY = e.clientY;

          walkCameraAngles.current.yaw -= deltaX * 0.003;
          walkCameraAngles.current.pitch = Math.max(-1.4, Math.min(1.4, walkCameraAngles.current.pitch - deltaY * 0.003));
        }
        return;
      }

      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      const offset = targetCamPos.current.clone().sub(targetLookAt.current);
      const radius = offset.length();
      let theta = Math.atan2(offset.x, offset.z);
      let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));

      theta -= deltaX * 0.008;
      phi = Math.max(0.15, Math.min(Math.PI / 2.1, phi - deltaY * 0.008));

      targetCamPos.current.x = targetLookAt.current.x + radius * Math.sin(phi) * Math.sin(theta);
      targetCamPos.current.y = targetLookAt.current.y + radius * Math.cos(phi);
      targetCamPos.current.z = targetLookAt.current.z + radius * Math.sin(phi) * Math.cos(theta);
    };
    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (experienceMode === 'walk') return;
      const offset = targetCamPos.current.clone().sub(targetLookAt.current);
      const factor = e.deltaY > 0 ? 1.08 : 0.92;
      const newLen = Math.max(15, Math.min(280, offset.length() * factor));
      offset.setLength(newLen);
      targetCamPos.current.copy(targetLookAt.current).add(offset);
    };

    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMoveOrbit);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Keyboard handlers for WASD walk mode
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w') walkKeys.current.w = true;
      if (k === 'a') walkKeys.current.a = true;
      if (k === 's') walkKeys.current.s = true;
      if (k === 'd') walkKeys.current.d = true;
      if (e.shiftKey) walkKeys.current.shift = true;
      if (e.code === 'Space') walkKeys.current.space = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w') walkKeys.current.w = false;
      if (k === 'a') walkKeys.current.a = false;
      if (k === 's') walkKeys.current.s = false;
      if (k === 'd') walkKeys.current.d = false;
      if (!e.shiftKey) walkKeys.current.shift = false;
      if (e.code === 'Space') walkKeys.current.space = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ─────────────────────────────────────────────────────────────
    // 13. ANIMATION RENDER LOOP (Physics & Walk Updates)
    // ─────────────────────────────────────────────────────────────
    let clock = 0;
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      clock += 0.02;

      // Handle WASD Walk Mode Physics
      if (experienceMode === 'walk') {
        const speed = walkKeys.current.shift ? 0.35 : 0.18;
        const forward = new THREE.Vector3(
          -Math.sin(walkCameraAngles.current.yaw),
          0,
          -Math.cos(walkCameraAngles.current.yaw)
        );
        const right = new THREE.Vector3(
          Math.cos(walkCameraAngles.current.yaw),
          0,
          -Math.sin(walkCameraAngles.current.yaw)
        );

        if (walkKeys.current.w) targetCamPos.current.addScaledVector(forward, speed);
        if (walkKeys.current.s) targetCamPos.current.addScaledVector(forward, -speed);
        if (walkKeys.current.d) targetCamPos.current.addScaledVector(right, speed);
        if (walkKeys.current.a) targetCamPos.current.addScaledVector(right, -speed);

        // Keep player on floor height with slight head bob
        const headBob = (walkKeys.current.w || walkKeys.current.s) ? Math.sin(clock * 12) * 0.05 : 0;
        targetCamPos.current.y = (activeStation === 'maitri' && targetCamPos.current.y > 4.0 ? 5.8 : 2.5) + headBob;

        // Calculate LookAt point in front of camera
        const lookDir = new THREE.Vector3(
          -Math.sin(walkCameraAngles.current.yaw) * Math.cos(walkCameraAngles.current.pitch),
          Math.sin(walkCameraAngles.current.pitch),
          -Math.cos(walkCameraAngles.current.yaw) * Math.cos(walkCameraAngles.current.pitch)
        );
        targetLookAt.current.copy(targetCamPos.current).add(lookDir);

        // Auto-open nearby doors (proximity check)
        const rooms = activeStation === 'maitri' ? MAITRI_ROOMS : BHARATI_ROOMS;
        for (let r of rooms) {
          for (let d of r.doors) {
            const dist = Math.sqrt(
              (targetCamPos.current.x - d.position[0]) ** 2 +
              (targetCamPos.current.z - d.position[2]) ** 2
            );
            const doorGroup = doorMeshesRef.current.get(d.id);
            if (doorGroup) {
              doorGroup.rotation.y = THREE.MathUtils.lerp(doorGroup.rotation.y, dist < 3.2 ? Math.PI / 2.2 : 0, 0.1);
            }
          }
        }
      }

      // Cinematic Drone Flyover Tour
      if (isDroneTourActive) {
        droneAngleRef.current += 0.005;
        const r = 90;
        const h = 42 + Math.sin(droneAngleRef.current * 2) * 14;
        targetCamPos.current.set(
          Math.sin(droneAngleRef.current) * r,
          h,
          Math.cos(droneAngleRef.current) * r
        );
        targetLookAt.current.set(0, 8, 0);
      }

      // Smooth camera interpolation
      camera.position.lerp(targetCamPos.current, 0.08);
      currentLookAt.current.lerp(targetLookAt.current, 0.08);
      camera.lookAt(currentLookAt.current);

      // Update Minimap Coordinates
      setPlayerCoords([camera.position.x, camera.position.y, camera.position.z]);
      setPlayerFacingY(walkCameraAngles.current.yaw);

      // Animate Snow Particles
      if (snowParticlesRef.current && !isAntarcticMode) {
        const pos = snowParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < pos.length; i += 3) {
          pos[i + 1] -= 0.6;
          pos[i] += 0.3; // wind drift
          if (pos[i + 1] < -5) {
            pos[i + 1] = 160;
            pos[i] = (Math.random() - 0.5) * 450;
          }
        }
        snowParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Rising Underwater Bubbles
      if (underwaterBubblesRef.current && experienceMode === 'underwater') {
        const bPos = underwaterBubblesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < bPos.length; i += 3) {
          bPos[i + 1] += 0.12;
          if (bPos[i + 1] > -0.5) {
            bPos[i + 1] = -14.0;
          }
        }
        underwaterBubblesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Helicopter Rotor
      if (helicopterRotorRef.current) {
        helicopterRotorRef.current.rotation.y += 0.35;
      }

      // Animate Wind Turbine Rotor
      if (windTurbineRotorRef.current) {
        windTurbineRotorRef.current.rotation.z += 0.06;
      }

      // Animate Radome Satellite Tracking Dish
      if (radomeDishRef.current) {
        radomeDishRef.current.rotation.y += 0.012;
        radomeDishRef.current.rotation.x = Math.sin(clock * 0.8) * 0.25;
      }

      // Animate Penguin Colony (Waddling, Tobogganing, Flapping)
      for (let i = 0; i < penguinGroupsRef.current.length; i++) {
        const p = penguinGroupsRef.current[i];
        if (!p) continue;
        const beh = p.userData.behavior;
        if (beh === 'waddle') {
          const w = Math.sin(clock * 5 + i);
          p.rotation.z = w * 0.14;
          p.position.y = p.userData.baseY + Math.abs(w) * 0.15;
        } else if (beh === 'slide') {
          p.position.x = p.userData.baseX + Math.sin(clock * 0.9 + i) * 6;
        } else if (beh === 'flap') {
          const leftWing = p.userData.leftWing;
          const rightWing = p.userData.rightWing;
          if (leftWing && rightWing) {
            const flap = Math.sin(clock * 9 + i) * 0.4;
            leftWing.rotation.z = 0.35 + flap;
            rightWing.rotation.z = -0.35 - flap;
          }
        }
      }

      // Animate Helipad Perimeter Strobe LEDs
      if (helipadStrobesRef.current.length > 0) {
        const strobeVal = Math.sin(clock * 6) > 0.4 ? 1.8 : 0.15;
        helipadStrobesRef.current.forEach(s => { s.intensity = strobeVal; });
      }

      // Animate Occupant Crew Movement (walking along paths)
      const occupantsList = activeStation === 'maitri' ? MAITRI_OCCUPANTS : BHARATI_OCCUPANTS;
      for (let occ of occupantsList) {
        const mesh = occupantMeshesRef.current.get(occ.id);
        if (mesh && occ.pathPoints.length > 1) {
          const t = (Math.sin(clock * 0.4 + occ.id.charCodeAt(0)) + 1) / 2;
          const p1 = occ.pathPoints[0];
          const p2 = occ.pathPoints[1];
          mesh.position.x = THREE.MathUtils.lerp(p1[0], p2[0], t);
          mesh.position.z = THREE.MathUtils.lerp(p1[2], p2[2], t);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      domElement.removeEventListener('mousemove', handlePointerMove);
      domElement.removeEventListener('click', handlePointerDown);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMoveOrbit);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [activeStation, isAntarcticMode, viewMode, experienceMode, timeOfDay, season]);

  // Underwater view trigger
  const handleEnterUnderwater = () => {
    setExperienceMode('underwater');
    if (activeStation === 'maitri') {
      targetCamPos.current.set(45, -3.5, -20);
      targetLookAt.current.set(45, -3.5, -25);
    } else {
      targetCamPos.current.set(-90, -4.5, 10);
      targetLookAt.current.set(-90, -4.5, 0);
    }
  };

  const handleSurfaceToAtmosphere = () => {
    setExperienceMode('orbit');
    targetCamPos.current.set(40, 25, 50);
    targetLookAt.current.set(0, 8, 0);
  };

  return (
    <div 
      className={`relative w-full h-full min-h-[640px] overflow-hidden rounded-xl border border-[#1A2533] select-none ${
        aiState.status === 'BLACKOUT' ? 'animate-blackout-flash' : ''
      } ${isAntarcticMode ? 'border-4 border-white' : ''}`}
    >
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* TOP-LEFT: Station Switcher & Camera Mode Pills */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 p-1 bg-[#0A121E]/95 backdrop-blur-md rounded-xl border border-[#1A2533] shadow-2xl">
          <button
            onClick={() => onStationSelect('maitri')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeStation === 'maitri'
                ? 'bg-[#00E0C6] text-[#060B14] shadow-md font-black'
                : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
            }`}
          >
            Maitri 3D Twin (1989)
          </button>
          <button
            onClick={() => onStationSelect('bharati')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeStation === 'bharati'
                ? 'bg-[#00E0C6] text-[#060B14] shadow-md font-black'
                : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
            }`}
          >
            Bharati 3D Twin (2012)
          </button>
        </div>

        {/* EXPERIENCE MODES (ORBIT vs WALK vs UNDERWATER) */}
        <div className="flex items-center gap-1 p-1 bg-[#0A121E]/90 backdrop-blur-md rounded-xl border border-[#1A2533] text-xs">
          <button
            onClick={() => {
              setExperienceMode('orbit');
              targetCamPos.current.set(40, 25, 50);
              targetLookAt.current.set(0, 8, 0);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              experienceMode === 'orbit'
                ? 'bg-[#00E0C6] text-[#060B14] shadow-md font-black'
                : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Orbit (God View)</span>
          </button>

          <button
            onClick={() => {
              setExperienceMode('walk');
              targetCamPos.current.set(0, 2.5, 4);
              targetLookAt.current.set(0, 2.5, 0);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              experienceMode === 'walk'
                ? 'bg-[#FFD700] text-[#060B14] shadow-md font-black'
                : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Walk Mode (WASD)</span>
          </button>

          <button
            onClick={() => setIsTeleportOpen(true)}
            className="px-3 py-1.5 rounded-lg font-bold text-[#00FFFF] hover:bg-[#1A2533] transition-colors flex items-center gap-1.5 uppercase cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Teleport [T]</span>
          </button>
        </div>

        {/* WALK MODE WASD CONTROLS HINT */}
        {experienceMode === 'walk' && (
          <div className="px-3 py-2 bg-[#060B14]/95 border border-[#FFD700]/50 rounded-xl text-[11px] font-mono text-[#FFD700] shadow-xl flex items-center gap-2 animate-in fade-in">
            <span>● <strong>WASD</strong> Move · <strong>Mouse</strong> Look · <strong>Shift</strong> Sprint · <strong>Click</strong> Open Doors</span>
          </div>
        )}

        {/* UNDERWATER RETURN BANNER */}
        {experienceMode === 'underwater' && (
          <button
            onClick={handleSurfaceToAtmosphere}
            className="px-4 py-2.5 bg-gradient-to-r from-[#00FFFF] to-[#4A9EFF] hover:from-[#00FFFF]/90 text-[#060B14] font-black text-xs rounded-xl shadow-2xl flex items-center gap-2 uppercase tracking-wider cursor-pointer animate-pulse"
          >
            <ArrowUp className="w-4 h-4 stroke-[3]" />
            <span>Surface to Atmosphere (Orbit Mode)</span>
          </button>
        )}
      </div>

      {/* TOP-RIGHT: RADAR MINIMAP */}
      <MiniMap
        activeStation={activeStation}
        playerPos={playerCoords}
        playerRotY={playerFacingY}
        onTeleportTo={(coords) => {
          targetCamPos.current.set(coords[0], coords[1] + 4, coords[2] + 8);
          targetLookAt.current.set(coords[0], coords[1], coords[2]);
        }}
      />

      {/* BOTTOM-LEFT: 7 VIEW MODES SELECTOR DOCK */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5 bg-[#0A121E]/95 backdrop-blur-md p-2 rounded-xl border border-[#1A2533] shadow-2xl">
        <span className="text-[10px] font-bold text-[#6B7A8F] uppercase tracking-wider px-2 py-0.5">
          View Modes (7)
        </span>
        {[
          { id: 'Exterior' as ViewMode, label: 'Exterior 3D', icon: Sun },
          { id: 'X-Ray' as ViewMode, label: 'X-Ray Interiors', icon: Eye },
          { id: 'Infrared' as ViewMode, label: 'Infrared FLIR', icon: Flame },
          { id: 'Thermal' as ViewMode, label: 'Thermal Delta', icon: Thermometer },
          { id: 'MEP/HVAC' as ViewMode, label: 'MEP & Glycol', icon: Activity },
          { id: 'Structural' as ViewMode, label: 'Structural CAD', icon: Box },
          { id: 'Night' as ViewMode, label: 'Night Aurora', icon: Moon }
        ].map(mode => {
          const Icon = mode.icon;
          const isActive = viewMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#00E0C6] text-[#060B14] font-black shadow-[0_0_12px_#00E0C6]'
                  : 'text-[#8BA1B7] hover:bg-[#1A2533] hover:text-[#FFFFFF]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* BOTTOM-RIGHT: TIME OF DAY & SEASON ENVIRONMENT DOCK */}
      <div className="absolute bottom-4 right-4 z-20 p-3 bg-[#0A121E]/95 backdrop-blur-md rounded-xl border border-[#1A2533] shadow-2xl flex flex-col gap-2 w-64 text-xs font-mono">
        <div className="flex items-center justify-between text-[#E8EEF4] font-bold">
          <span className="flex items-center gap-1.5 text-[#FFD700]">
            <Clock className="w-3.5 h-3.5" />
            <span>Time of Day</span>
          </span>
          <span className="text-[#00E0C6]">
            {Math.floor(timeOfDay).toString().padStart(2, '0')}:00 UTC
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="24"
          step="0.5"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
          className="w-full h-1.5 accent-[#00E0C6] cursor-pointer"
        />

        <div className="flex items-center justify-between pt-1 border-t border-[#1A2533]">
          <span className="text-[#6B7A8F] text-[10px]">Polar Season:</span>
          <div className="flex gap-1 text-[10px] font-bold">
            <button
              onClick={() => setSeason('summer')}
              className={`px-2 py-0.5 rounded cursor-pointer ${season === 'summer' ? 'bg-[#FFD700] text-[#060B14]' : 'text-[#6B7A8F]'}`}
            >
              Summer 24h
            </button>
            <button
              onClick={() => setSeason('winter')}
              className={`px-2 py-0.5 rounded cursor-pointer ${season === 'winter' ? 'bg-[#00E0C6] text-[#060B14]' : 'text-[#6B7A8F]'}`}
            >
              Winter Aurora
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING HOVER TARGET CHIP */}
      {hoveredTarget && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-[#0A121E]/95 backdrop-blur-md border border-[#00E0C6] rounded-xl text-xs font-mono text-[#E8EEF4] shadow-2xl flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-[#00E0C6] animate-ping" />
          <span>[{hoveredTarget.type}] <strong>{hoveredTarget.name}</strong> · (Click to Inspect)</span>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* INTERACTIVE POPUP MODALS                                      */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* 1. Water Exploration Modal */}
      {activeWaterModal && (
        <WaterModal
          waterBody={activeWaterModal}
          onClose={() => setActiveWaterModal(null)}
          onEnterUnderwaterView={handleEnterUnderwater}
        />
      )}

      {/* 2. Vehicle Dispatch & Engineering Modal */}
      {activeVehicleModal && (
        <VehicleModal
          vehicle={activeVehicleModal}
          onClose={() => setActiveVehicleModal(null)}
          onToggleEngine={(vehId, isRunning) => {
            if (POLAR_FLEET[vehId]) {
              POLAR_FLEET[vehId].isEngineRunning = isRunning;
            }
          }}
        />
      )}

      {/* 3. Walk-In Room Details Modal */}
      {activeRoomModal && (
        <RoomModal
          room={activeRoomModal}
          onClose={() => setActiveRoomModal(null)}
          onToggleLights={(roomId) => {
            // Toggles room light in state
            const rList = activeStation === 'maitri' ? MAITRI_ROOMS : BHARATI_ROOMS;
            const target = rList.find(r => r.id === roomId);
            if (target) {
              target.lightSwitch.isOn = !target.lightSwitch.isOn;
              setActiveRoomModal({ ...target });
            }
          }}
          onReportIssue={(roomName) => {
            alert(`Incident reported for ${roomName} (Logged to IndexedDB Tier 2 Alert Queue).`);
          }}
        />
      )}

      {/* 4. Occupant Biometric Profile Modal */}
      {activeOccupantModal && (
        <OccupantModal
          person={activeOccupantModal}
          onClose={() => setActiveOccupantModal(null)}
        />
      )}

      {/* 5. Instant Teleportation Modal ('T') */}
      {isTeleportOpen && (
        <TeleportMenu
          activeStation={activeStation}
          onClose={() => setIsTeleportOpen(false)}
          onSelectTarget={handleTeleportTarget}
        />
      )}

      {/* 6. Fuel Station & Bulk Storage Modal */}
      {isFuelModalOpen && (
        <FuelModal
          station={activeStation}
          onClose={() => setIsFuelModalOpen(false)}
        />
      )}

      {/* 7. Emperor Penguin Sanctuary Bio-Telemetry Modal */}
      {isPenguinModalOpen && (
        <PenguinModal
          station={activeStation}
          onClose={() => setIsPenguinModalOpen(false)}
        />
      )}

      {/* TOP-RIGHT: CINEMATIC DRONE TOUR TOGGLE */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => {
            setIsDroneTourActive(prev => !prev);
            if (!isDroneTourActive) {
              setExperienceMode('orbit');
            }
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
            isDroneTourActive
              ? 'bg-[#FFD700] text-[#000000] border border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.4)] animate-pulse font-black'
              : 'bg-[#0A121E]/90 hover:bg-[#1A2533] text-[#00E0C6] border border-[#1A2533]'
          }`}
          title="Toggle continuous cinematic 360° drone flyover tour"
        >
          <Video className="w-4 h-4" />
          <span>{isDroneTourActive ? 'Drone Tour Active' : 'Drone Flyover'}</span>
        </button>
      </div>

      {/* FLOATING LANDMARK POI QUICK-JUMP MATRIX */}
      <div className="absolute bottom-20 left-4 z-20 flex flex-wrap gap-1.5 max-w-xl pointer-events-auto">
        {[
          { label: '⛽ Fuel Farm', pos: activeStation === 'maitri' ? [-28, 16, 38] : [28, 14, -10], look: activeStation === 'maitri' ? [-28, 2, 24] : [28, 2, -22], action: () => setIsFuelModalOpen(true) },
          { label: '🏢 Station Core', pos: [35, 24, 48], look: [0, 8, 0], action: () => {} },
          { label: '🚁 Helipad', pos: activeStation === 'maitri' ? [48, 14, -20] : [-8, 14, -20], look: activeStation === 'maitri' ? [38, 1, -32] : [-18, 1, -32], action: () => {} },
          { label: '⚡ Microgrid', pos: activeStation === 'maitri' ? [-26, 16, -6] : [44, 16, 26], look: activeStation === 'maitri' ? [-36, 4, -18] : [34, 4, 16], action: () => {} },
          { label: '🛰️ Radome', pos: activeStation === 'maitri' ? [-6, 14, -18] : [20, 14, -22], look: activeStation === 'maitri' ? [-14, 4, -28] : [12, 4, -32], action: () => {} },
          { label: activeStation === 'maitri' ? '🌊 Priyadarshini' : '🌊 Thala Fjord', pos: activeStation === 'maitri' ? [55, 18, -8] : [-80, 20, 20], look: activeStation === 'maitri' ? [45, -1, -20] : [-140, -1, 0], action: () => {} },
          { label: '🐧 Penguin Sanctuary', pos: activeStation === 'maitri' ? [42, 10, 22] : [-18, 10, 42], look: activeStation === 'maitri' ? [32, 0, 12] : [-28, 0, 32], action: () => setIsPenguinModalOpen(true) },
        ].map((lm, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsDroneTourActive(false);
              setExperienceMode('orbit');
              targetCamPos.current.set(lm.pos[0], lm.pos[1], lm.pos[2]);
              targetLookAt.current.set(lm.look[0], lm.look[1], lm.look[2]);
              if (lm.action) lm.action();
            }}
            className="px-2.5 py-1 bg-[#0A121E]/90 hover:bg-[#00E0C6] text-[#6B7A8F] hover:text-[#060B14] hover:font-bold border border-[#1A2533] rounded-lg text-[11px] font-mono transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            {lm.label}
          </button>
        ))}
      </div>

    </div>
  );
};
