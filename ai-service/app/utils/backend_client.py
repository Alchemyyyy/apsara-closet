import aiohttp
import os
from typing import List, Dict, Any, Optional
import numpy as np

class BackendClient:
    """Client to communicate with main backend API"""
    
    def __init__(self):
        self.base_url = os.getenv("BACKEND_API_URL", "http://localhost:3000/api")
    
    async def get_products_with_features(
        self,
        category: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Fetch products that have AI features extracted
        
        Args:
            category: Filter by category ID
            limit: Maximum number of products
            
        Returns:
            List of products with their feature vectors
        """
        try:
            url = f"{self.base_url}/product-features/all"
            
            params = {"limit": limit}
            if category:
                params["category"] = category
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        products = data.get("products", [])
                        
                        # Process products to extract features as numpy arrays
                        processed_products = []
                        for product in products:
                            if product.get("aiFeatures") and len(product["aiFeatures"]) > 0:
                                # Get the first feature set (usually from first image)
                                feature_data = product["aiFeatures"][0]
                                features = feature_data.get("features", [])
                                
                                # Convert to numpy array
                                if isinstance(features, list) and len(features) > 0:
                                    product["feature_vector"] = np.array(features, dtype=np.float32)
                                    processed_products.append(product)
                        
                        print(f"✅ Fetched {len(processed_products)} products with features")
                        return processed_products
                    else:
                        print(f"⚠️  Backend returned status {response.status}")
                        return []
                        
        except Exception as e:
            print(f"❌ Failed to fetch products with features: {str(e)}")
            return []
    
    async def get_all_products(
        self,
        category: Optional[str] = None,
        is_active: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Fetch all products from backend (fallback method)
        
        Args:
            category: Filter by category ID
            is_active: Only get active products
            
        Returns:
            List of products
        """
        try:
            url = f"{self.base_url}/products"
            
            params = {"limit": 100}
            if category:
                params["category"] = category
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("products", [])
                    else:
                        print(f"⚠️  Backend returned status {response.status}")
                        return []
                        
        except Exception as e:
            print(f"❌ Failed to fetch products from backend: {str(e)}")
            return []
    
    async def get_product_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        """
        Get single product by ID
        
        Args:
            product_id: Product ID
            
        Returns:
            Product data or None
        """
        try:
            url = f"{self.base_url}/products/{product_id}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("product")
                    else:
                        return None
                        
        except Exception as e:
            print(f"❌ Failed to fetch product: {str(e)}")
            return None
    
    async def trigger_feature_extraction(self, product_id: str) -> bool:
        """
        Trigger feature extraction for a specific product
        
        Args:
            product_id: Product ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            url = f"{self.base_url}/product-features/extract/{product_id}"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url) as response:
                    if response.status == 200:
                        print(f"✅ Feature extraction triggered for product {product_id}")
                        return True
                    else:
                        print(f"⚠️  Feature extraction failed with status {response.status}")
                        return False
                        
        except Exception as e:
            print(f"❌ Failed to trigger feature extraction: {str(e)}")
            return False