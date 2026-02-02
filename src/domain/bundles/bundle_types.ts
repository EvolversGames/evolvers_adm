// frontend/src/domain/bundle/bundle_types.ts

export type ProductType = 'course' | 'asset' | 'software' | 'bundle' | 'article';

// ============================================================================
// BUNDLE ITEM
// ============================================================================

export interface BundleItem {
  id: number;
  bundle_id: number;
  product_id: number;
  product_type: ProductType;
  sort_order: number;
  created_at: string;
  
  // Dados do produto
  title: string;
  slug?: string;
  image?: string;
  price?: number;
  original_price?: number;
  duration_text?: string;
  
  // Dados relacionados
  instructor?: string;
  level?: string;
  level_color?: string;
  software?: string;
  software_color?: string;
  software_icon?: string;
  category?: string;
  badge?: string;
  cornerBadge?: string;
}

// ============================================================================
// BUNDLE
// ============================================================================

export interface Bundle {
  id: number;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  image: string;
  price: number;
  original_price: number;
  discount_percentage: number;
  category_id: number;
  category_name?: string;
  featured: boolean;
  active: boolean;
  purchase_url?: string | null;
  items: BundleItem[];
  created_at: string;
  updated_at: string;
  items_count?: number;
}

// ============================================================================
// CREATE / UPDATE - COM SORT_ORDER!
// ============================================================================

export interface CreateBundleData {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  price: number;
  original_price: number;
  category_id: number;
  featured?: boolean;
  active?: boolean;
    purchase_url?: string | null;
  items?: {
    product_type: ProductType;
    product_id: number;
    sort_order: number; // ← ADICIONADO!
  }[];
}

export interface UpdateBundleData {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  price?: number;
  original_price?: number;
  category_id?: number;
  featured?: boolean;
  active?: boolean;
  purchase_url?: string | null;
  items?: {
    product_type: ProductType;
    product_id: number;
    sort_order: number; // ← ADICIONADO!
  }[];
}

// ============================================================================
// FILTERS / RESPONSE
// ============================================================================

export interface BundleFilters {
  category?: string;
  featured?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
  limit?: number;
  offset?: number;
    include_inactive?: boolean; 
}

export interface BundlesResponse {
  bundles: Bundle[];
  total: number;
  limit: number;
  offset: number;
}