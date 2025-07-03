
import { County } from "@/pages/Index";

export const mockCounties: County[] = [
  {
    id: "harris",
    name: "Harris County",
    population: 4731145,
    cancerIncidence: 425.2,
    cancerMortality: 165.8,
    povertyRate: 18.2,
    healthcareAccess: 72.5,
    pollutionLevel: 78,
    deathRate: 165.8,
    coordinates: [-95.3698, 29.7604],
    sites: [
      {
        id: "ship-channel",
        name: "Houston Ship Channel Industrial Complex",
        type: "chemical_plant",
        coordinates: [-95.2631, 29.7347],
        description: "Major petrochemical facility with various chemical emissions",
        riskLevel: "high"
      },
      {
        id: "baytown-refinery",
        name: "Baytown Refinery",
        type: "industrial",
        coordinates: [-95.0332, 29.7355],
        description: "Large oil refinery with air quality concerns",
        riskLevel: "high"
      }
    ]
  },
  {
    id: "dallas",
    name: "Dallas County",
    population: 2647627,
    cancerIncidence: 398.7,
    cancerMortality: 152.3,
    povertyRate: 16.8,
    healthcareAccess: 75.2,
    pollutionLevel: 65,
    deathRate: 152.3,
    coordinates: [-96.7970, 32.7767],
    sites: [
      {
        id: "trinity-landfill",
        name: "Trinity River Landfill",
        type: "landfill",
        coordinates: [-96.8147, 32.7357],
        description: "Municipal waste facility near residential areas",
        riskLevel: "medium"
      }
    ]
  },
  {
    id: "tarrant",
    name: "Tarrant County",
    population: 2110640,
    cancerIncidence: 402.1,
    cancerMortality: 158.9,
    povertyRate: 14.5,
    healthcareAccess: 78.1,
    pollutionLevel: 58,
    deathRate: 158.9,
    coordinates: [-97.3308, 32.7555],
    sites: [
      {
        id: "cement-plant",
        name: "TXI Cement Plant",
        type: "industrial",
        coordinates: [-97.4208, 32.6555],
        description: "Cement manufacturing with dust and emission concerns",
        riskLevel: "medium"
      }
    ]
  },
  {
    id: "bexar",
    name: "Bexar County",
    population: 2009324,
    cancerIncidence: 389.4,
    cancerMortality: 145.2,
    povertyRate: 17.9,
    healthcareAccess: 71.8,
    pollutionLevel: 52,
    deathRate: 145.2,
    coordinates: [-98.4936, 29.4241],
    sites: [
      {
        id: "quarry-operations",
        name: "Alamo Quarry Operations",
        type: "mining",
        coordinates: [-98.4536, 29.4741],
        description: "Stone quarrying operations with air quality impacts",
        riskLevel: "low"
      }
    ]
  },
  {
    id: "travis",
    name: "Travis County",
    population: 1290188,
    cancerIncidence: 375.8,
    cancerMortality: 142.7,
    povertyRate: 13.2,
    healthcareAccess: 82.4,
    pollutionLevel: 45,
    deathRate: 142.7,
    coordinates: [-97.7431, 30.2672],
    sites: [
      {
        id: "power-station",
        name: "Decker Creek Power Station",
        type: "power_plant",
        coordinates: [-97.6431, 30.1872],
        description: "Natural gas power plant with air emissions",
        riskLevel: "low"
      }
    ]
  },
  {
    id: "collin",
    name: "Collin County",
    population: 1064465,
    cancerIncidence: 358.2,
    cancerMortality: 135.6,
    povertyRate: 8.9,
    healthcareAccess: 89.2,
    pollutionLevel: 38,
    deathRate: 135.6,
    coordinates: [-96.6389, 33.1972],
    sites: []
  },
  {
    id: "fort-bend",
    name: "Fort Bend County",
    population: 811688,
    cancerIncidence: 342.9,
    cancerMortality: 128.4,
    povertyRate: 9.7,
    healthcareAccess: 85.6,
    pollutionLevel: 41,
    deathRate: 128.4,
    coordinates: [-95.6890, 29.5844],
    sites: []
  },
  {
    id: "montgomery",
    name: "Montgomery County",
    population: 594391,
    cancerIncidence: 368.7,
    cancerMortality: 148.3,
    povertyRate: 11.4,
    healthcareAccess: 79.8,
    pollutionLevel: 47,
    deathRate: 148.3,
    coordinates: [-95.4739, 30.3199],
    sites: [
      {
        id: "waste-facility",
        name: "Conroe Waste Management Facility",
        type: "landfill",
        coordinates: [-95.4539, 30.2899],
        description: "Regional waste processing center",
        riskLevel: "medium"
      }
    ]
  },
  {
    id: "williamson",
    name: "Williamson County",
    population: 590551,
    cancerIncidence: 355.1,
    cancerMortality: 134.8,
    povertyRate: 7.8,
    healthcareAccess: 87.3,
    pillutionLevel: 35,
    deathRate: 134.8,
    coordinates: [-97.6648, 30.6099],
    sites: []
  },
  {
    id: "hidalgo",
    name: "Hidalgo County",
    population: 870781,
    cancerIncidence: 392.5,
    cancerMortality: 151.7,
    povertyRate: 28.4,
    healthcareAccess: 58.9,
    pollutionLevel: 62,
    deathRate: 151.7,
    coordinates: [-98.1624, 26.3012],
    sites: [
      {
        id: "border-industry",
        name: "Maquiladora Industrial Complex",
        type: "industrial",
        coordinates: [-98.1324, 26.2712],
        description: "Cross-border manufacturing with environmental concerns",
        riskLevel: "high"
      }
    ]
  },
  {
    id: "galveston",
    name: "Galveston County",
    population: 342139,
    cancerIncidence: 415.3,
    cancerMortality: 172.9,
    povertyRate: 15.6,
    healthcareAccess: 68.7,
    pollutionLevel: 84,
    deathRate: 172.9,
    coordinates: [-94.9774, 29.301],
    sites: [
      {
        id: "chemical-complex",
        name: "Texas City Chemical Complex",
        type: "chemical_plant",
        coordinates: [-94.9074, 29.4010],
        description: "Major petrochemical facility with history of incidents",
        riskLevel: "high"
      },
      {
        id: "refinery-complex",
        name: "Marathon Petroleum Refinery",
        type: "industrial",
        coordinates: [-94.8774, 29.3510],
        description: "Oil refinery operations near residential areas",
        riskLevel: "high"
      }
    ]
  },
  {
    id: "jefferson",
    name: "Jefferson County",
    population: 252273,
    cancerIncidence: 445.8,
    cancerMortality: 182.4,
    povertyRate: 19.7,
    healthcareAccess: 64.2,
    pollutionLevel: 89,
    deathRate: 182.4,
    coordinates: [-94.1049, 29.9966],
    sites: [
      {
        id: "golden-triangle",
        name: "Golden Triangle Refinery District",
        type: "industrial",
        coordinates: [-94.1349, 30.0266],
        description: "Concentrated petrochemical refining operations",
        riskLevel: "high"
      },
      {
        id: "port-arthur",
        name: "Port Arthur Industrial Complex",
        type: "chemical_plant",
        coordinates: [-93.9399, 29.8966],
        description: "Large-scale chemical processing facilities",
        riskLevel: "high"
      }
    ]
  }
];
