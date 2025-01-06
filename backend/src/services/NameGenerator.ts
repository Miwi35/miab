import { readFileSync } from 'fs';
import { join } from 'path';

export class NameGenerator {
  private animals: string[] = [];
  private adjectives: string[] = [];

  constructor() {
    const animalsPath = join(__dirname, '../data/animals.txt');
    const adjectivesPath = join(__dirname, '../data/adjectives.txt');

    this.animals = readFileSync(animalsPath, 'utf-8').split('\n').filter(Boolean);
    this.adjectives = readFileSync(adjectivesPath, 'utf-8').split('\n').filter(Boolean);
  }

  generateName(): string {
    const animal = this.animals[Math.floor(Math.random() * this.animals.length)];
    const firstLetter = animal.charAt(0).toUpperCase();
    
    const matchingAdjectives = this.adjectives.filter(adj => 
      adj.charAt(0).toUpperCase() === firstLetter
    );

    if (matchingAdjectives.length === 0) {
      // Fallback to any adjective if no matching one found
      const adjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
      return `${adjective} ${animal}`;
    }

    const adjective = matchingAdjectives[Math.floor(Math.random() * matchingAdjectives.length)];
    return `${adjective} ${animal}`;
  }
} 