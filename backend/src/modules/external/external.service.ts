import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const TMDB_BASE = 'https://api.themoviedb.org/3';

@Injectable()
export class ExternalService {
  constructor(private configService: ConfigService) {}

  private getApiKey() {
    const apiKey = this.configService.get<string>('TMDB_API_KEY');
    if (!apiKey) {
      throw new BadRequestException('TMDB API key not configured');
    }
    return apiKey;
  }

  async search(query: string, type = 'movie') {
    if (!query) {
      throw new BadRequestException('Query is required');
    }
    const apiKey = this.getApiKey();
    const url = `${TMDB_BASE}/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new BadRequestException('TMDB search failed');
    }
    return res.json();
  }

  async trending(type = 'movie') {
    const apiKey = this.getApiKey();
    const url = `${TMDB_BASE}/trending/${type}/week?api_key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new BadRequestException('TMDB trending failed');
    }
    return res.json();
  }

  async details(id: string, type = 'movie') {
    const apiKey = this.getApiKey();
    const url = `${TMDB_BASE}/${type}/${id}?api_key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new BadRequestException('TMDB details failed');
    }
    return res.json();
  }
}
