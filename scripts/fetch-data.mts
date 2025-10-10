#!/usr/bin/env node

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

interface Item {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string;
  website: string;
}

interface Marker {
  id: string;
  address: string;
  private_type: string;
  public_type: string;
  verified: boolean;
  confidence: number;
  last_verified: string;
}

const MATERIALS = ['copper', 'lead', 'galvanized', 'plastic', 'unknown'];

function getRandomMaterial(): string {
  return MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
}

async function fetchData(): Promise<User[]> {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }
  return response.json();
}

function createItems(users: User[]): Item[] {
  return users.slice(0, 15).map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
    website: user.website
  }));
}

function createMarkers(users: User[]): Marker[] {
  return users.slice(0, 20).map((user, index) => ({
    id: `parcel_${user.id}`,
    address: `${user.id} ${user.name} St, City, ST ${10000 + index}`,
    private_type: getRandomMaterial(),
    public_type: getRandomMaterial(),
    verified: Math.random() > 0.3, // 70% verified
    confidence: 0.7 + Math.random() * 0.3, // 0.7-1.0
    last_verified: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));
}

async function main() {
  try {
    console.log('Fetching data from JSONPlaceholder...');
    const users = await fetchData();

    console.log('Processing items...');
    const items = createItems(users);

    console.log('Processing markers...');
    const markers = createMarkers(users);

    // Ensure directory exists
    mkdirSync(join(process.cwd(), 'public', 'data'), { recursive: true });

    // Write files
    writeFileSync(
      join(process.cwd(), 'public', 'data', 'items.json'),
      JSON.stringify(items, null, 2)
    );

    writeFileSync(
      join(process.cwd(), 'public', 'data', 'markers.json'),
      JSON.stringify(markers, null, 2)
    );

    console.log('Data files updated successfully!');
    console.log(`- items.json: ${items.length} items`);
    console.log(`- markers.json: ${markers.length} markers`);

  } catch (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }
}

main();