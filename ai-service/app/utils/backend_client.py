import aiohttp
import os
from typing import List, Dict, Any, Optional

class BackendClient:
    """Client to communicate with main backend API"""
    
    def __init__(self):
        self.base_url = os.getenv("BACKEND_API_URL", "http://localhost:3000/api")
    
    async def get_all_products(
        self,
        category: Optional[str] = None,
        is_active: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Fetch all products from backend
        
        Args:
            category: Filter by category ID
            is_active: Only get active products
            
        Returns:
            List of products
        """
        try:
            url = f"{self.base_url}/products"
            
            params = {
                "limit": 100,  # Get more products for better matching
            }
            
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
