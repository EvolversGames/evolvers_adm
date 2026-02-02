// frontend/src/pages/admin/Bundles/useBundleFormController.ts

import { useState, useEffect } from 'react';
import { bundlesStorage } from '../../data/bundles/bundles';
import { productRepository } from '../../data/products/productRepository';
import type { Bundle, CreateBundleData, UpdateBundleData, ProductType } from '../../domain/bundles/bundle_types';
import type { Product } from '../../domain/products/products';
import { 
  validateCreateBundle, 
  validateUpdateBundle, 
  hasErrors as hasValidationErrors,
  type BundleErrors 
} from '../../domain/bundles/bundle_validation';
import { handleApiError } from '../../domain/bundles/apiErrorValidator';
import { bundlesApi } from '../../data/bundles/bundles_api';


interface BundleItemForm {
  id: string;
  product_id: number;
  product_type: ProductType;
  title: string;
  image?: string;
  price?: number;
  sort_order: number;
  purchase_url?: string | null;
}

interface BundleFormState {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  price: string;
  original_price: string;
  category_id: string;
  featured: boolean;
  active: boolean;
  purchase_url?: string | null;
}
function normalizePurchaseUrl(value: string | null | undefined): string | null {
  const v = (value ?? '').trim();
  return v.length > 0 ? v : null;
}

export const useBundleFormController = (bundleId?: number) => {
  const isEditMode = !!bundleId;

  const [formData, setFormData] = useState<BundleFormState>({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    price: '',
    original_price: '',
    category_id: '',
    featured: false,
    active: true,
    purchase_url: null
  });

  const [bundleItems, setBundleItems] = useState<BundleItemForm[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProductType, setSelectedProductType] = useState<ProductType>('course');
  const [imageFile, setImageFile] = useState<File | null>(null); // ← ADICIONADO
  
  const [loading, setLoading] = useState(false);
  const [loadingBundle, setLoadingBundle] = useState(isEditMode);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errors, setErrors] = useState<BundleErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && bundleId) {
      loadBundle(bundleId);
    } else {
      setLoadingBundle(false);
    }
  }, [bundleId, isEditMode]);

  useEffect(() => {
    loadProducts(selectedProductType);
  }, [selectedProductType]);

  const loadBundle = async (id: number) => {
    try {
      setLoadingBundle(true);
      setApiError(null);
      
      const bundle: Bundle = await bundlesStorage.loadBundleById(id);
      
      console.log('🔍 Bundle carregado:', bundle);
      console.log('🔍 category_id:', bundle.category_id);
      
      setFormData({
        title: bundle.title || '',
        subtitle: bundle.subtitle || '',
        description: bundle.description || '',
        image: bundle.image || '',
        price: bundle.price ? String(bundle.price) : '',
        purchase_url: normalizePurchaseUrl(bundle.purchase_url),
        original_price: bundle.original_price ? String(bundle.original_price) : '',
        category_id: bundle.category_id ? String(bundle.category_id) : '',
        featured: bundle.featured || false,
        active: bundle.active !== undefined ? bundle.active : true
      });
      
      console.log('✅ FormData setado com category_id:', bundle.category_id ? String(bundle.category_id) : '');

      if (bundle.items && bundle.items.length > 0) {
        const mappedItems: BundleItemForm[] = bundle.items.map((item, index) => ({
          id: `item-${Date.now()}-${index}`,
          product_id: item.product_id,
          product_type: item.product_type,
          title: item.title,
          image: item.image,
          price: item.price || 0,
          sort_order: index + 1
        }));
        setBundleItems(mappedItems);
      }
    } catch (err: any) {
      setApiError(err.message || 'Erro ao carregar bundle');
      console.error('Erro ao carregar bundle:', err);
    } finally {
      setLoadingBundle(false);
    }
  };

  const loadProducts = async (type: ProductType) => {
    try {
      setLoadingProducts(true);
      const products = await productRepository.getFiltered({ type, status: 'active' });
      setAvailableProducts(products);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setAvailableProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleFieldChange = (name: keyof BundleFormState, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof BundleErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof BundleErrors];
        return newErrors;
      });
    }
  };

  const handleImageChange = (file: File | null, blobUrl: string) => {
    setImageFile(file);
    setFormData(prev => ({ ...prev, image: blobUrl }));
  };

  const handleAddItem = (productId: number): boolean => {
    const product = availableProducts.find(p => p.id === productId);
    if (!product) return false;

    if (bundleItems.some(item => item.product_id === productId)) {
      return false;
    }

    const newItem: BundleItemForm = {
      id: `item-${Date.now()}`,
      product_id: product.id,
      product_type: product.product_type,
      title: product.title,
      image: product.image_url,
      price: product.price,
      sort_order: bundleItems.length + 1
    };

    setBundleItems(prev => [...prev, newItem]);
    return true;
  };

  const handleRemoveItem = (itemId: string) => {
    setBundleItems(prev => {
      const filtered = prev.filter(item => item.id !== itemId);
      return filtered.map((item, index) => ({
        ...item,
        sort_order: index + 1
      }));
    });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === bundleItems.length - 1) return;

    const newItems = [...bundleItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    const reordered = newItems.map((item, idx) => ({
      ...item,
      sort_order: idx + 1
    }));
    
    setBundleItems(reordered);
  };

  const validate = (): boolean => {
    const bundleData: CreateBundleData | UpdateBundleData = {
      title: formData.title,
      subtitle: formData.subtitle || undefined,
      description: formData.description || undefined,
      image: formData.image,
      price: Number(formData.price),
      original_price: Number(formData.original_price),
      category_id: Number(formData.category_id),
      featured: formData.featured,
      active: formData.active,
      purchase_url: formData.purchase_url || undefined,
      items: bundleItems.map((item, index) => ({
        product_type: item.product_type,
        product_id: item.product_id,
        sort_order: index + 1
      }))
    };

    const validationErrors = isEditMode
      ? validateUpdateBundle(bundleData as UpdateBundleData)
      : validateCreateBundle(bundleData as CreateBundleData);

    setErrors(validationErrors);
    return !hasValidationErrors(validationErrors);
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (!validate()) {
      return false;
    }

    try {
      setLoading(true);
      setApiError(null);
      setErrors({});

      // 🔥 SE TEM ARQUIVO E É BLOB, FAZ UPLOAD PRIMEIRO
      let finalImageUrl = formData.image;
      if (imageFile && formData.image.startsWith('blob:')) {
        console.log('📤 Fazendo upload da imagem...');
        finalImageUrl = await bundlesApi.uploadBundleImage(imageFile);
        console.log('✅ Upload concluído:', finalImageUrl);
      }

      const bundleData = {
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        description: formData.description || undefined,
        image: finalImageUrl,
        price: Number(formData.price),
        original_price: Number(formData.original_price),
        category_id: Number(formData.category_id),
        featured: formData.featured,
        active: formData.active,
        purchase_url: normalizePurchaseUrl(formData.purchase_url),

        items: bundleItems.map((item, index) => ({
          product_type: item.product_type,
          product_id: item.product_id,
          sort_order: index + 1
        }))
      };

      if (isEditMode && bundleId) {
        await bundlesStorage.updateBundle(bundleId, bundleData as UpdateBundleData);
      } else {
        await bundlesStorage.createBundle(bundleData as CreateBundleData);
      }

      return true;
    } catch (err: any) {
      console.error('Erro ao salvar bundle:', err);
      
      const apiErrorData = handleApiError(err);
      setApiError(apiErrorData.message);
      
      if (apiErrorData.isValidation && Object.keys(apiErrorData.errors).length > 0) {
        setErrors(apiErrorData.errors);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (): number => {
    if (!formData.price || !formData.original_price) return 0;
    const price = Number(formData.price);
    const originalPrice = Number(formData.original_price);
    if (originalPrice <= 0) return 0;
    return Math.round((1 - price / originalPrice) * 100);
  };

  const calculateSavings = (): number => {
    if (!formData.price || !formData.original_price) return 0;
    const price = Number(formData.price);
    const originalPrice = Number(formData.original_price);
    return Math.max(0, originalPrice - price);
  };

 const calculateTotalItemsPrice = (): number => {
  return bundleItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
};

  return {
    formData,
    bundleItems,
    availableProducts,
    selectedProductType,
    imageFile, // ← EXPÕE imageFile
    loading,
    loadingBundle,
    loadingProducts,
    errors,
    apiError,
    isEditMode,

    handleFieldChange,
    handleImageChange, // ← NOVA FUNÇÃO
    handleAddItem,
    handleRemoveItem,
    handleMoveItem,
    handleSubmit,
    setSelectedProductType,

    calculateDiscount,
    calculateSavings,
    calculateTotalItemsPrice
  };
};