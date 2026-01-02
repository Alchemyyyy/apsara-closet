import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any

class SimilaritySearch:
    """Find similar products using cosine similarity"""
    
    def __init__(self):
        self.similarity_threshold = 0.3  # Minimum similarity to include
    
    def find_similar(
        self,
        query_features: np.ndarray,
        products: List[Dict[str, Any]],
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Find most similar products to query using REAL cosine similarity
        
        Args:
            query_features: Feature vector from query image (1280-dim)
            products: List of products WITH feature_vector key
            top_k: Number of results to return
            
        Returns:
            List of products sorted by similarity (highest first)
        """
        try:
            if not products:
                print("⚠️  No products available for comparison")
                return []
            
            # Filter products that have features
            products_with_features = [
                p for p in products 
                if "feature_vector" in p and p["feature_vector"] is not None
            ]
            
            if not products_with_features:
                print("⚠️  No products have feature vectors")
                return []
            
            print(f"🔍 Comparing with {len(products_with_features)} products...")
            
            # Reshape query features for sklearn
            query_features_2d = query_features.reshape(1, -1)
            
            # Calculate similarities for all products
            results = []
            for product in products_with_features:
                try:
                    # Get product features
                    product_features = product["feature_vector"]
                    
                    # Ensure it's a numpy array
                    if not isinstance(product_features, np.ndarray):
                        product_features = np.array(product_features, dtype=np.float32)
                    
                    # Reshape for sklearn
                    product_features_2d = product_features.reshape(1, -1)
                    
                    # Calculate cosine similarity
                    similarity = cosine_similarity(query_features_2d, product_features_2d)[0][0]
                    
                    # Only include if above threshold
                    if similarity >= self.similarity_threshold:
                        results.append({
                            "id": product["id"],
                            "name": product["name"],
                            "slug": product["slug"],
                            "price": product["price"],
                            "images": product["images"],
                            "category": product.get("category", {}),
                            "similarity": float(similarity),
                            "match_percentage": int(similarity * 100)
                        })
                    
                except Exception as e:
                    print(f"⚠️  Error comparing product {product.get('name', 'unknown')}: {str(e)}")
                    continue
            
            # Sort by similarity (highest first)
            results.sort(key=lambda x: x["similarity"], reverse=True)
            
            # Return top K results
            top_results = results[:top_k]
            
            print(f"✨ Found {len(top_results)} similar products")
            if top_results:
                print(f"   Best match: {top_results[0]['name']} ({top_results[0]['match_percentage']}%)")
            
            return top_results
            
        except Exception as e:
            print(f"❌ Similarity search failed: {str(e)}")
            raise
    
    def calculate_similarity(
        self,
        features1: np.ndarray,
        features2: np.ndarray
    ) -> float:
        """
        Calculate cosine similarity between two feature vectors
        
        Args:
            features1: First feature vector
            features2: Second feature vector
            
        Returns:
            Similarity score (0-1)
        """
        try:
            # Reshape to 2D for sklearn
            f1 = features1.reshape(1, -1)
            f2 = features2.reshape(1, -1)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(f1, f2)[0][0]
            
            return float(similarity)
            
        except Exception as e:
            print(f"❌ Similarity calculation failed: {str(e)}")
            raise
    
    def calculate_similarity_batch(
        self,
        query_features: np.ndarray,
        product_features_list: List[np.ndarray]
    ) -> np.ndarray:
        """
        Calculate similarities for multiple products at once (faster)
        
        Args:
            query_features: Single query feature vector
            product_features_list: List of product feature vectors
            
        Returns:
            Array of similarity scores
        """
        try:
            # Reshape query
            query_2d = query_features.reshape(1, -1)
            
            # Stack all product features
            products_2d = np.vstack([f.reshape(1, -1) for f in product_features_list])
            
            # Calculate all similarities at once
            similarities = cosine_similarity(query_2d, products_2d)[0]
            
            return similarities
            
        except Exception as e:
            print(f"❌ Batch similarity calculation failed: {str(e)}")
            raise