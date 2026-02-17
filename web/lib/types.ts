// Thumbnail types
export interface Thumbnail {
  id: number;
  group: string;
  file_path: string;
  title: string | null;
  channel: string | null;
  year: number | null;
  views: number | null;
  ctr: number | null;
  features_extracted: boolean;
  features: ThumbnailFeatures | null;
  cluster_id: number | null;
}

export interface ThumbnailFeatures {
  color?: ColorFeatures;
  text?: TextFeatures;
  face?: FaceFeatures;
  pose?: PoseFeatures;
  depth?: DepthFeatures;
  title?: TitleFeatures;
}

export interface TitleFeatures {
  cleaned_title: string;
  is_filename_derived: boolean;
  char_count: number;
  word_count: number;
  has_number: boolean;
  number_count: number;
  has_large_number: boolean;
  has_money_reference: boolean;
  first_person: boolean;
  has_superlative: boolean;
  has_challenge_framing: boolean;
  uppercase_ratio: number;
  exclamation_count: number;
  question_mark: boolean;
  avg_word_length: number;
}

export interface ColorFeatures {
  avg_saturation: number;
  avg_brightness: number;
  hue_hist: number[];
  dominant_palette: string[];
  warm_cool_score: number;
}

export interface TextFeatures {
  has_text: boolean;
  text_area_ratio: number;
  text_box_count: number;
  text_position_heat: {
    top: number;
    middle: number;
    bottom: number;
  };
  detected_text?: string[];
}

export interface FaceFeatures {
  face_count: number;
  largest_face_area_ratio: number;
  avg_face_area_ratio: number;
  emotion_proxies: {
    smile_score: number;
    mouth_open_score: number;
    brow_raise_score: number;
  };
}

export interface PoseFeatures {
  people_count: number;
  hand_visible_count: number;
  pose_orientation: string;
  body_coverage: number;
}

export interface DepthFeatures {
  depth_contrast: number;
  foreground_ratio: number;
  subject_depth_center: {
    x: number;
    y: number;
  };
  depth_range: number;
}

// API Response types
export interface ThumbnailListResponse {
  items: Thumbnail[];
  total: number;
  page: number;
  page_size: number;
}

export interface OverviewStats {
  total_thumbnails: number;
  by_group: Record<string, number>;
  by_year: Record<string, number>;
  features_extracted: number;
  missing_views: number;
  missing_ctr: number;
}

export interface DistributionStats {
  feature: string;
  group: string | null;
  values: number[];
  histogram: Array<{
    bin_start: number;
    bin_end: number;
    count: number;
  }>;
  stats: {
    count: number;
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    q25: number;
    q75: number;
  };
}

export interface CompareStats {
  feature: string;
  groups: Record<string, {
    count: number;
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
  }>;
}

export interface ClusterPoint {
  id: number;
  x: number;
  y: number;
  cluster_id: number | null;
  group: string;
  file_path: string;
  title: string | null;
}

export interface ClusteringResult {
  method: string;
  k: number;
  sample_count: number;
  cluster_stats: Record<number, {
    count: number;
    groups: Record<string, number>;
  }>;
  explained_variance: number[];
  feature_names: string[];
}

export interface PipelineStatus {
  total_thumbnails: number;
  processed: number;
  unprocessed: number;
  completion_percentage: number;
}

export interface MrBeastSimilarityResponse {
  feature_names: string[];
  mrbeast_centroid: Record<string, number>;
  groups: Record<string, {
    count: number;
    mean_similarity: number;
    median_similarity: number;
    std_similarity: number;
  }>;
  feature_trends: Record<string, Record<string, number>>;
}

export interface TitleLikenessResponse {
  criteria: string[];
  max_score: number;
  groups: Record<string, {
    count: number;
    mean_score: number;
    median_score: number;
    pct_4plus: number;
    pct_5plus: number;
    pct_6plus: number;
    pct_7plus: number;
    pct_8: number;
    score_distribution: Record<string, number>;
  }>;
}

export interface CombinedLikenessResponse {
  max_score: number;
  groups: Record<string, {
    count: number;
    thumbnail_mean: number;
    title_mean: number;
    combined_mean: number;
    combined_median: number;
    combined_pct_8plus: number;
    combined_pct_10plus: number;
    combined_pct_12plus: number;
  }>;
}

export interface ConvergenceTestsResponse {
  ttest?: {
    t_statistic: number;
    p_value: number;
    significant: boolean;
    early_mean: number;
    late_mean: number;
    early_n: number;
    late_n: number;
  };
  cohens_d?: {
    d: number;
    interpretation: string;
  };
  anova?: {
    f_statistic: number;
    p_value: number;
    significant: boolean;
    num_groups: number;
    groups: string[];
  };
  linear_regression?: {
    slope: number;
    intercept: number;
    r_squared: number;
    p_value: number;
    significant: boolean;
    std_err: number;
    n: number;
  };
  year_confidence_intervals: Record<string, {
    mean: number;
    ci_low: number;
    ci_high: number;
    n: number;
    sem: number;
  }>;
}

export interface WeightedLikenessResponse {
  weights: Record<string, number>;
  max_possible_score: number;
  groups: Record<string, {
    count: number;
    mean_score: number;
    median_score: number;
    normalized_mean: number;
  }>;
}
