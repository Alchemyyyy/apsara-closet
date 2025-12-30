from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv
from typing import List, Optional
import shutil
from pathlib import Path

from app.services.feature_extractor import FeatureExtractor
from app.services.similarity_search import SimilaritySearch
from app.utils.image_processor import ImageProcessor
from app.utils.backend_client import BackendClient

load_dotenv()

app = FastAPI(
    title="Apsara Closet AI Service",
    description="AI-powered visual search for fashion products",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
feature_extractor = FeatureExtractor()
similarity_search = SimilaritySearch()
image_processor = ImageProcessor()
backend_client = BackendClient()

# Directories
UPLOAD_DIR = Path("uploads")
TEMP_DIR = Path("temp")
UPLOAD_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    print("🚀 AI Service starting...")
    print("📦 Loading AI model...")
    feature_extractor.load_model()
    print("✅ AI Service ready!")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Apsara Closet AI Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "visual_search": "/visual-search",
            "extract_features": "/extract-features",
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": feature_extractor.model is not None,
        "model_name": feature_extractor.model_name,
    }

@app.post("/visual-search")
async def visual_search(
    file: UploadFile = File(...),
    limit: int = 10,
    category: Optional[str] = None
):
    """
    Visual search endpoint - Upload image and find similar products
    """
    try:
        # Validate file
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Save uploaded file temporarily
        temp_path = TEMP_DIR / file.filename
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"📸 Processing image: {file.filename}")
        
        # Process and extract features
        processed_image = image_processor.process_image(str(temp_path))
        query_features = feature_extractor.extract_features(processed_image)
        
        print(f"✅ Extracted features: {len(query_features)} dimensions")
        
        # Get all products from backend
        products = await backend_client.get_all_products(category=category)
        
        if not products:
            return JSONResponse(
                content={
                    "message": "No products available for comparison",
                    "results": []
                },
                status_code=200
            )
        
        print(f"🔍 Comparing with {len(products)} products...")
        
        # Find similar products
        similar_products = similarity_search.find_similar(
            query_features=query_features,
            products=products,
            top_k=limit
        )
        
        # Clean up temp file
        temp_path.unlink()
        
        print(f"✨ Found {len(similar_products)} similar products")
        
        return {
            "message": "Visual search completed",
            "query_image": file.filename,
            "total_products_compared": len(products),
            "results": similar_products
        }
        
    except Exception as e:
        print(f"❌ Error in visual search: {str(e)}")
        # Clean up temp file if exists
        if temp_path.exists():
            temp_path.unlink()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-features")
async def extract_features(file: UploadFile = File(...)):
    """
    Extract features from an image (for debugging/testing)
    """
    try:
        # Validate file
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Save temporarily
        temp_path = TEMP_DIR / file.filename
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process and extract
        processed_image = image_processor.process_image(str(temp_path))
        features = feature_extractor.extract_features(processed_image)
        
        # Clean up
        temp_path.unlink()
        
        return {
            "filename": file.filename,
            "feature_vector_size": len(features),
            "features": features.tolist()[:10],  # Show first 10 for demo
            "message": "Features extracted successfully"
        }
        
    except Exception as e:
        print(f"❌ Error extracting features: {str(e)}")
        if temp_path.exists():
            temp_path.unlink()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
