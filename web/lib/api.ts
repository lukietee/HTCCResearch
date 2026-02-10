import type {
  Thumbnail,
  ThumbnailListResponse,
  OverviewStats,
  DistributionStats,
  CompareStats,
  ClusterPoint,
  ClusteringResult,
  PipelineStatus,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Thumbnail endpoints
export async function getThumbnails(params?: {
  group?: string;
  year_min?: number;
  year_max?: number;
  has_text?: boolean;
  min_faces?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}): Promise<ThumbnailListResponse> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
  }
  const query = searchParams.toString();
  return fetchAPI<ThumbnailListResponse>(`/thumbnails${query ? `?${query}` : ''}`);
}

export async function getThumbnail(id: number): Promise<Thumbnail> {
  return fetchAPI<Thumbnail>(`/thumbnails/${id}`);
}

export async function getPipelineStatus(): Promise<PipelineStatus> {
  return fetchAPI<PipelineStatus>('/thumbnails/pipeline/status');
}

export async function runPipeline(params?: {
  group?: string;
  features?: string[];
  force?: boolean;
  limit?: number;
}): Promise<{ status: string; stats: Record<string, number> }> {
  return fetchAPI('/thumbnails/pipeline/run', {
    method: 'POST',
    body: JSON.stringify(params || {}),
  });
}

export async function ingestThumbnails(force = false): Promise<{ status: string; results: Record<string, unknown> }> {
  return fetchAPI(`/thumbnails/ingest?force=${force}`, {
    method: 'POST',
  });
}

// Stats endpoints
export async function getOverviewStats(): Promise<OverviewStats> {
  return fetchAPI<OverviewStats>('/stats/overview');
}

export async function getDistribution(
  feature: string,
  group?: string,
  bins = 20
): Promise<DistributionStats> {
  const params = new URLSearchParams({ feature, bins: String(bins) });
  if (group) params.set('group', group);
  return fetchAPI<DistributionStats>(`/stats/distributions?${params}`);
}

export async function compareGroups(feature: string): Promise<CompareStats> {
  return fetchAPI<CompareStats>(`/stats/compare?feature=${feature}`);
}

export async function getCorrelations(target: 'views' | 'ctr' = 'views'): Promise<{
  target: string;
  total_samples: number;
  correlations: Array<{
    feature: string;
    correlation: number;
    p_value: number;
    sample_size: number;
    significant: boolean;
  }>;
}> {
  return fetchAPI(`/stats/correlations?target=${target}`);
}

export async function getMrBeastLikeness(): Promise<{
  criteria: string[];
  max_score: number;
  groups: Record<string, {
    count: number;
    mean_score: number;
    median_score: number;
    pct_4plus: number;
    pct_5plus: number;
    pct_6: number;
    score_distribution: Record<string, number>;
  }>;
}> {
  return fetchAPI('/stats/mrbeast-likeness');
}

export async function getChannelEvolution(minYears = 2): Promise<{
  total_channels: number;
  channels: Record<string, {
    num_years: number;
    years: Record<string, { count: number; mean_score: number; pct_4plus: number }>;
  }>;
  trends: Array<{
    channel: string;
    slope: number;
    start_score: number;
    end_score: number;
    start_year: string;
    end_year: string;
    num_years: number;
  }>;
  summary: {
    converging_toward_mrbeast: number;
    diverging_from_mrbeast: number;
    flat: number;
    avg_slope: number;
  };
}> {
  return fetchAPI(`/stats/channel-evolution?min_years=${minYears}`);
}

// Clustering endpoints
export async function runClustering(params?: {
  k?: number;
  group?: string;
  method?: string;
}): Promise<ClusteringResult> {
  const searchParams = new URLSearchParams();
  if (params?.k) searchParams.set('k', String(params.k));
  if (params?.group) searchParams.set('group', params.group);
  if (params?.method) searchParams.set('method', params.method);
  return fetchAPI<ClusteringResult>(`/clustering/run?${searchParams}`);
}

export async function getClusteringPoints(group?: string): Promise<ClusterPoint[]> {
  const params = group ? `?group=${group}` : '';
  return fetchAPI<ClusterPoint[]>(`/clustering/points${params}`);
}

export async function getClusteringSummary(): Promise<{
  total_processed: number;
  clustered: number;
  num_clusters: number;
  cluster_ids: number[];
}> {
  return fetchAPI('/clustering/summary');
}

// Helper to get thumbnail image URL
export function getThumbnailImageUrl(filePath: string): string {
  // Convert absolute path to relative URL
  const parts = filePath.split('/thumbnails/');
  if (parts.length > 1) {
    return `${API_BASE}/static/thumbnails/${parts[1]}`;
  }
  return filePath;
}
