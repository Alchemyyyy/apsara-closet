import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any

class SimilaritySearch:
    """Find similar products using cosine similarity"""
    
    def __init__(self):
        self.similarity_threshold = 0.5
    
    def find_similar(
        self,
        query_features: np.ndarray,
        products: List[Dict[str, Any]],
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Find most similar products to query
        
        Args:
            query_features: Feature vector from query image
            products: List of products from backend
            top_k: Number of results to return
            
        Returns:
            List of products sorted by similarity
        """
        try:
            # For now, return mock results since we don't have product features yet
            # In production, you'd compare query_features with stored product features
            
            # Calculate random similarities for demo (we'll improve this later)
            results = []
            
            for product in products[:top_k]:
                # Mock similarity score (0-1)
                # In production: cosine_similarity(query_features, product_features)
                similarity = np.random.uniform(0.6, 0.95)
                
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
            
            # Sort by similarity (highest first)
            results.sort(key=lambda x: x["similarity"], reverse=True)
            
            return results
            
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
